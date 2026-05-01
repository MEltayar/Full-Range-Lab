import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePlanStore } from '../store/planStore';
import { usePaymentProofStore } from '../store/paymentProofStore';
import { BrandTile } from './Brand';
import ProofForm from './ProofForm';
import { VODAFONE_CASH_NUMBER, INSTAPAY_HANDLE, RENEWAL_CONTACT } from '../lib/paymentConfig';

export default function SubscriptionExpiredWall() {
  const signOut          = useAuthStore((s) => s.signOut);
  const subscription     = usePlanStore((s) => s.subscription);
  const myProofs         = usePaymentProofStore((s) => s.myProofs);
  const loadMyProofs     = usePaymentProofStore((s) => s.loadMine);
  const submitProof      = usePaymentProofStore((s) => s.submit);

  const [signingOut, setSigningOut] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { void loadMyProofs(); }, [loadMyProofs]);

  async function handleSignOut() {
    setSigningOut(true);
    try { await signOut(); } finally { setSigningOut(false); }
  }

  const endLabel = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  const pendingProof = myProofs.find((p) => p.status === 'pending');

  return (
    <div className="flex items-center justify-center min-h-screen px-4 overflow-hidden relative py-10">
      <div className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.45) 0%, rgba(6,3,1,0.82) 100%)' }} />
      <div className="absolute pointer-events-none" style={{ width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: 'rgba(10,5,2,0.70)', boxShadow: '0 32px 80px rgba(0,0,0,0.65)' }}>

          <div className="flex justify-center mb-5">
            <BrandTile className="w-14 h-14 rounded-2xl shadow-2xl" />
          </div>

          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Your subscription has ended</h1>
          <p className="text-sm mb-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Send a renewal payment to keep using Full Range Lab.
          </p>
          {endLabel && (
            <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Ended {endLabel}
            </p>
          )}
          {!endLabel && <div className="mb-6" />}

          <div className="text-left rounded-xl border border-white/10 p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[11px] uppercase tracking-wider mb-3 font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
              How to renew
            </p>
            <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <div className="flex items-baseline justify-between gap-3">
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>Vodafone Cash</span>
                <span className="font-mono font-semibold">{VODAFONE_CASH_NUMBER}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>Instapay</span>
                <span className="font-mono font-semibold">{INSTAPAY_HANDLE}</span>
              </div>
            </div>
            <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              After paying, upload the receipt below or send it to {RENEWAL_CONTACT}.
            </p>
          </div>

          {pendingProof ? (
            <div className="text-left rounded-xl border border-amber-400/30 p-4 mb-6"
              style={{ background: 'rgba(245,158,11,0.10)' }}>
              <p className="text-xs font-semibold text-amber-300 mb-1">Receipt received — under review</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Submitted {new Date(pendingProof.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.
                We usually reactivate within a few hours.
              </p>
            </div>
          ) : showForm ? (
            <ProofForm
              onCancel={() => setShowForm(false)}
              onSubmit={async (args) => { await submitProof(args); setShowForm(false); }}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 mb-3 text-sm font-semibold rounded-lg text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>
              Upload payment receipt
            </button>
          )}

          {/* Reviewed proofs (rejections give the trainer something to act on) */}
          {myProofs.some((p) => p.status === 'rejected') && (
            <div className="text-left text-[11px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {myProofs.filter((p) => p.status === 'rejected').slice(0, 1).map((p) => (
                <p key={p.id}>
                  Last submission was rejected{p.adminNotes ? ` — ${p.adminNotes}` : '.'} Try again with a clearer receipt.
                </p>
              ))}
            </div>
          )}

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { if (!signingOut) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}

