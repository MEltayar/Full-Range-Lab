import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PaymentProof, PaymentMethod } from '../types';

const BUCKET = 'payment-proofs';
const SIGNED_URL_TTL = 60 * 60;

interface SubmitArgs {
  file: File;
  method: PaymentMethod;
  amountPaid: number | null;
  referenceNote: string | null;
  requestedPlan: 'pro_monthly' | 'pro_yearly';
}

function rowToProof(row: Record<string, unknown>): PaymentProof {
  return {
    id:             row.id as string,
    userId:         row.user_id as string,
    storagePath:    row.storage_path as string,
    method:         row.method as PaymentMethod,
    amountPaid:     row.amount_paid != null ? Number(row.amount_paid) : null,
    referenceNote:  (row.reference_note as string) ?? null,
    requestedPlan:  row.requested_plan as 'pro_monthly' | 'pro_yearly',
    status:         row.status as PaymentProof['status'],
    reviewedBy:     (row.reviewed_by as string) ?? null,
    reviewedAt:     (row.reviewed_at as string) ?? null,
    adminNotes:     (row.admin_notes as string) ?? null,
    createdAt:      row.created_at as string,
  };
}

interface PaymentProofStore {
  myProofs: PaymentProof[];
  isLoaded: boolean;
  loadMine: () => Promise<void>;
  submit: (args: SubmitArgs) => Promise<void>;
}

export const usePaymentProofStore = create<PaymentProofStore>((set) => ({
  myProofs: [],
  isLoaded: false,

  loadMine: async () => {
    const { data, error } = await supabase
      .from('payment_proofs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      set({ isLoaded: true });
      return;
    }
    set({ myProofs: (data ?? []).map(rowToProof), isLoaded: true });
  },

  submit: async ({ file, method, amountPaid, referenceNote, requestedPlan }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const id = crypto.randomUUID();
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${user.id}/${id}.${ext}`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });
    if (upErr) throw upErr;

    const { data, error } = await supabase
      .from('payment_proofs')
      .insert({
        id,
        user_id: user.id,
        storage_path: path,
        method,
        amount_paid: amountPaid,
        reference_note: referenceNote,
        requested_plan: requestedPlan,
      })
      .select('*')
      .single();
    if (error) {
      // Roll back the upload so we don't orphan storage
      await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
      throw error;
    }

    set((s) => ({ myProofs: [rowToProof(data), ...s.myProofs] }));
  },
}));

// Admin-only helpers — kept here so the call sites have one place to look.

export async function listAllPaymentProofs(): Promise<PaymentProof[]> {
  const { data, error } = await supabase
    .from('payment_proofs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(rowToProof);
}

export async function signPaymentProofUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function approvePaymentProof(
  proofId: string,
  periodEndIso: string,
  adminNotes: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('approve_payment_proof', {
    p_proof_id: proofId,
    p_period_end: periodEndIso,
    p_admin_notes: adminNotes,
  });
  if (error) throw error;
}

export async function rejectPaymentProof(
  proofId: string,
  adminNotes: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('reject_payment_proof', {
    p_proof_id: proofId,
    p_admin_notes: adminNotes,
  });
  if (error) throw error;
}
