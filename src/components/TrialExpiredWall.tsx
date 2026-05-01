import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BrandTile } from './Brand';

export default function TrialExpiredWall() {
  const signOut  = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch {
      // Auth cleared locally even on error — navigate anyway
      navigate('/login');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 overflow-hidden relative">

      <style>{`
        @keyframes tew-fall {
          0%   { transform: translateY(-70px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.45) 0%, rgba(6,3,1,0.82) 100%)' }} />
      <div className="absolute pointer-events-none" style={{ width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: 'rgba(10,5,2,0.70)', boxShadow: '0 32px 80px rgba(0,0,0,0.65)' }}>

          <div className="flex justify-center mb-5">
            <BrandTile className="w-14 h-14 rounded-2xl shadow-2xl" />
          </div>

          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Your free trial has ended</h1>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Upgrade to Pro to continue using Full Range Lab — unlimited clients, PDF export, branding, and more.
          </p>

          <Link to="/pricing"
            className="block w-full py-3 text-white text-sm font-bold rounded-xl mb-3 transition-all"
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 4px 20px rgba(249,115,22,0.40)' }}>
            View pricing plans →
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { if (!signingOut) e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
