import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDualRole, type ActiveRole } from '../hooks/useDualRole';
import { BrandTile } from '../components/Brand';

export default function RolePickerPage() {
  const navigate = useNavigate();
  const { isDualRole, isTrainer, isLinkedClient, linkedClientId, setActiveRole } = useDualRole();
  const [trainerName, setTrainerName] = useState<string | null>(null);

  // Single-role users shouldn't be here — bounce them to wherever they belong.
  useEffect(() => {
    if (!isDualRole) {
      if (isTrainer) navigate('/', { replace: true });
      else if (isLinkedClient) navigate('/client', { replace: true });
      else navigate('/login', { replace: true });
    }
  }, [isDualRole, isTrainer, isLinkedClient, navigate]);

  // Look up the inviting trainer's display name for the client-card label.
  // Two-step lookup because the Client mapper doesn't expose user_id.
  useEffect(() => {
    if (!linkedClientId) return;
    let cancelled = false;
    (async () => {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', linkedClientId)
        .maybeSingle();
      if (cancelled || !clientRow?.user_id) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', clientRow.user_id)
        .maybeSingle();
      // display_name often falls back to the trainer's email — strip the domain
      // so the picker reads "Continue as client of mostafa" not "...@gmail.com".
      const raw = profile?.display_name?.trim() ?? '';
      const clean = raw.includes('@') ? raw.split('@')[0] : raw;
      if (!cancelled) setTrainerName(clean || null);
    })();
    return () => { cancelled = true; };
  }, [linkedClientId]);

  function pick(role: ActiveRole) {
    setActiveRole(role);
    navigate(role === 'trainer' ? '/' : '/client', { replace: true });
  }

  if (!isDualRole) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative">

      <style>{`
        @keyframes rp-card {
          0%   { opacity: 0; transform: translateY(28px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes rp-logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 8px 32px rgba(249,115,22,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 8px 48px rgba(249,115,22,0.65); }
        }
        @keyframes rp-overlay-shift {
          0%   { opacity: 1; }
          50%  { opacity: 0.88; }
          100% { opacity: 1; }
        }
        .rp-tile {
          background: rgba(8,4,1,0.72);
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .rp-tile:hover {
          transform: translateY(-3px);
          border-color: rgba(249,115,22,0.55) !important;
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), 0 0 32px rgba(249,115,22,0.18), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .rp-tile:active {
          transform: translateY(-1px) scale(0.99);
          transition: transform 0.08s ease;
        }
        .rp-icon-trainer {
          background: linear-gradient(135deg, rgba(249,115,22,0.22), rgba(220,38,38,0.18));
          border: 1px solid rgba(249,115,22,0.28);
        }
        .rp-icon-client {
          background: linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.18));
          border: 1px solid rgba(59,130,246,0.28);
        }
      `}</style>

      {/* Background photo */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />

      {/* Vignette overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.42) 0%, rgba(6,3,1,0.80) 100%)',
        animation: 'rp-overlay-shift 12s ease-in-out infinite',
      }} />

      {/* Floating orange glow */}
      <div className="absolute pointer-events-none" style={{
        width: '620px', height: '620px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      {/* Content */}
      <div className="relative w-full max-w-2xl z-10" style={{ animation: 'rp-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="rounded-2xl overflow-hidden" style={{ animation: 'rp-logo-pulse 3s ease-in-out infinite' }}>
            <BrandTile className="w-16 h-16 rounded-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">Choose your view</h1>
            <p className="text-sm font-medium mt-2 max-w-md mx-auto" style={{ color: 'rgba(253,186,116,0.72)' }}>
              This account is linked as both a trainer and a client. Pick which side to use — you can switch any time.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => pick('trainer')}
            className="rp-tile group flex flex-col items-start gap-4 p-6 rounded-2xl border border-white/10 backdrop-blur-2xl text-left"
          >
            <div className="rp-icon-trainer w-12 h-12 rounded-xl flex items-center justify-center text-orange-300 group-hover:scale-110 transition-transform">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="text-base font-bold text-white">Continue as trainer</div>
              <p className="text-sm text-white/55 mt-1.5 leading-relaxed">
                Manage your own clients, programs, and diet plans.
              </p>
            </div>
          </button>

          <button
            onClick={() => pick('client')}
            className="rp-tile group flex flex-col items-start gap-4 p-6 rounded-2xl border border-white/10 backdrop-blur-2xl text-left"
          >
            <div className="rp-icon-client w-12 h-12 rounded-xl flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform">
              <User size={22} />
            </div>
            <div>
              <div className="text-base font-bold text-white">
                Continue as client{trainerName ? ` of ${trainerName}` : ''}
              </div>
              <p className="text-sm text-white/55 mt-1.5 leading-relaxed">
                View your training plan, log sessions, and track your progress.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
