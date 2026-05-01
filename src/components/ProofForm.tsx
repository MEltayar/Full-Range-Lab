import { useState } from 'react';
import type { PaymentMethod } from '../types';

interface Props {
  onCancel: () => void;
  onSubmit: (args: {
    file: File;
    method: PaymentMethod;
    amountPaid: number | null;
    referenceNote: string | null;
    requestedPlan: 'pro_monthly' | 'pro_yearly';
  }) => Promise<void>;
  defaultPlan?: 'pro_monthly' | 'pro_yearly';
}

export default function ProofForm({ onCancel, onSubmit, defaultPlan = 'pro_monthly' }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('vodafone_cash');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [plan, setPlan] = useState<'pro_monthly' | 'pro_yearly'>(defaultPlan);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError('Please attach a receipt image.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        file,
        method,
        amountPaid: amount ? Number(amount) : null,
        referenceNote: note.trim() || null,
        requestedPlan: plan,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-orange-400';
  const labelCls = 'block text-[11px] uppercase tracking-wider font-semibold mb-1.5';

  return (
    <form onSubmit={submit}
      className="text-left rounded-xl border border-white/10 p-4 mb-4 space-y-3"
      style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div>
        <label className={labelCls} style={{ color: 'rgba(255,255,255,0.55)' }}>Receipt</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={inputCls}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls} style={{ color: 'rgba(255,255,255,0.55)' }}>Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className={inputCls}
            style={{ background: 'rgba(20,10,4,0.95)' }}>
            <option value="vodafone_cash">Vodafone Cash</option>
            <option value="instapay">Instapay</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls} style={{ color: 'rgba(255,255,255,0.55)' }}>Plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as 'pro_monthly' | 'pro_yearly')}
            className={inputCls}
            style={{ background: 'rgba(20,10,4,0.95)' }}>
            <option value="pro_monthly">Pro Monthly</option>
            <option value="pro_yearly">Pro Yearly</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} style={{ color: 'rgba(255,255,255,0.55)' }}>Amount (EGP)</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Optional"
          className={inputCls}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      </div>

      <div>
        <label className={labelCls} style={{ color: 'rgba(255,255,255,0.55)' }}>Reference / sender</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Txn id, sender name, etc."
          className={inputCls}
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      </div>

      {error && <p className="text-xs text-red-300">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-2 text-sm rounded-lg border border-white/15"
          style={{ color: 'rgba(255,255,255,0.65)' }}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>
          {submitting ? 'Uploading…' : 'Submit receipt'}
        </button>
      </div>
    </form>
  );
}
