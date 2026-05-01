import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

export default function ClientSubscriptionExpiredWall({ endDate }: { endDate?: string }) {
  const signOut  = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch {
      navigate('/login');
    } finally {
      setSigningOut(false);
    }
  }

  // Pretty-print the end date if we have one (e.g., "Apr 12, 2026").
  const endLabel = endDate
    ? new Date(`${endDate}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  return (
    <div className="flex items-center justify-center min-h-screen px-4 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.45) 0%, rgba(6,3,1,0.82) 100%)' }} />
      <div className="absolute pointer-events-none" style={{ width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: 'rgba(10,5,2,0.70)', boxShadow: '0 32px 80px rgba(0,0,0,0.65)' }}>

          <div className="text-5xl mb-5">⏳</div>

          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Your subscription has ended</h1>
          <p className="text-sm mb-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Please reach out to your trainer to renew and keep your plan going.
          </p>
          {endLabel && (
            <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Ended {endLabel}
            </p>
          )}
          {!endLabel && <div className="mb-8" />}

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
