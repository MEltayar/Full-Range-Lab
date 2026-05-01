import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToClient, clientPatchToDbRow } from '../lib/mappers';
import type { Client } from '../types';

// Fields the linked client may edit on their own row. Trainer-owned
// fields (name, email, phone, generalNotes, trainerMessage, user_id…)
// are intentionally excluded — RLS allows row-level update, the app
// keeps the safe-field allowlist.
export type SelfProfilePatch = Partial<Pick<Client,
  | 'age' | 'heightCm' | 'weightKg' | 'fitnessGoal' | 'medicalHistory'
  | 'foodPreferences' | 'foodDislikes'
  | 'exercisePreferences' | 'exerciseDislikes'
  | 'allergies' | 'healthAlerts'
>>;

interface ClientPortalStore {
  linkedClient: Client | null;
  isLoaded: boolean;
  loadedForUserId: string | null;
  fetch: () => Promise<void>;
  updateOwnProfile: (patch: SelfProfilePatch) => Promise<void>;
  reset: () => void;
}

export const useClientPortalStore = create<ClientPortalStore>((set, get) => ({
  linkedClient: null,
  isLoaded: false,
  loadedForUserId: null,

  fetch: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ linkedClient: null, isLoaded: true, loadedForUserId: null });
        return;
      }
      let { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('client_user_id', user.id)
        .maybeSingle();
      if (error) throw error;

      // No row yet — try the deferred-link RPC. Catches users whose auth.users
      // INSERT happened before invited_at was stamped on the clients row, so
      // the link_invited_client trigger missed them.
      if (!data) {
        const { data: linked } = await supabase.rpc('link_self_to_client');
        if (linked === true) {
          const retry = await supabase
            .from('clients')
            .select('*')
            .eq('client_user_id', user.id)
            .maybeSingle();
          if (retry.error) throw retry.error;
          data = retry.data;
        }
      }
      set({
        linkedClient: data ? dbRowToClient(data) : null,
        isLoaded: true,
        loadedForUserId: user.id,
      });
    } catch {
      set({ linkedClient: null, isLoaded: true, loadedForUserId: null });
    }
  },

  updateOwnProfile: async (patch) => {
    const current = get().linkedClient;
    if (!current) throw new Error('No linked client');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const row = clientPatchToDbRow(patch);
    const { data, error } = await supabase
      .from('clients')
      .update(row)
      .eq('id', current.id)
      .eq('client_user_id', user.id)
      .select('*')
      .single();
    if (error) throw error;
    set({ linkedClient: dbRowToClient(data) });
  },

  reset: () => set({ linkedClient: null, isLoaded: false, loadedForUserId: null }),
}));
