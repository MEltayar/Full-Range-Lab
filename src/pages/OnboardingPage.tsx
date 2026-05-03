import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { BrandTile } from '../components/Brand';
import type { ProfileType } from '../types';

function seeded(n: number) { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); }

const GYM_ICONS = [
  '🏋️', '🏋️‍♂️', '💪', '🥊', '🥋', '🏅', '🎽',
  '⚡', '🔥', '🏆', '🥇', '🧘‍♂️', '🏃‍♂️', '🦾',
  '🩺', '❤️‍🔥', '🏇', '🤸‍♂️', '🚴‍♂️', '🧗‍♂️',
];

export default function OnboardingPage() {
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ProfileType | null>(null);
  const [saving, setSaving] = useState(false);

  const fallers = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    icon: GYM_ICONS[i % GYM_ICONS.length],
    left: `${seeded(i * 3) * 100}%`,
    size: `${18 + seeded(i * 7) * 24}px`,
    duration: `${7 + seeded(i * 5) * 9}s`,
    delay: `${seeded(i * 11) * 12}s`,
    opacity: 0.55 + seeded(i * 13) * 0.35,
  }));

  async function handleSelect(type: ProfileType) {
    setSelected(type);
    setSaving(true);
    await updateSettings({ profileType: type });
    navigate('/pricing', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative">

      <style>{`
        @keyframes ob-fall {
          0%   { transform: translateY(-70px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
        @keyframes ob-card {
          0%   { opacity: 0; transform: translateY(28px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ob-logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 8px 32px rgba(249,115,22,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 8px 48px rgba(249,115,22,0.65); }
        }
      `}</style>

      {/* Background photo */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      {/* Vignette overlay */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.42) 0%, rgba(6,3,1,0.82) 100%)' }} />
      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{ width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.11) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* Falling icons */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {fallers.map((f) => (
          <span key={f.id} style={{
            position: 'absolute', top: '-70px', left: f.left,
            fontSize: f.size, opacity: f.opacity, userSelect: 'none',
            animation: `ob-fall ${f.duration} ${f.delay} infinite linear`,
          }}>{f.icon}</span>
        ))}
      </div>

      {/* Content */}
      <div className="relative w-full max-w-2xl z-10 flex flex-col items-center gap-10"
        style={{ animation: 'ob-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl overflow-hidden" style={{ animation: 'ob-logo-pulse 3s ease-in-out infinite' }}>
            <BrandTile className="w-16 h-16 rounded-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">Full Range Lab</h1>
            <p className="text-sm font-semibold mt-1.5" style={{ color: 'rgba(253,186,116,0.75)' }}>
              All your clients, in one workspace
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">What best describes your role?</h2>
          <p className="text-white/45 text-sm mt-1.5">We'll tailor the platform to fit your workflow.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">

          {/* Personal Trainer */}
          <button
            onClick={() => !saving && handleSelect('gym')}
            disabled={saving}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-200"
            style={{
              background: selected === 'gym' ? 'rgba(249,115,22,0.18)' : 'rgba(10,5,2,0.55)',
              borderColor: selected === 'gym' ? '#f97316' : 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(16px)',
              boxShadow: selected === 'gym' ? '0 8px 32px rgba(249,115,22,0.30)' : '0 8px 32px rgba(0,0,0,0.4)',
              transform: selected === 'gym' ? 'scale(1.02)' : undefined,
            }}
          >
            <div className="text-5xl">💪</div>
            <div>
              <p className="text-lg font-bold text-white">Personal Trainer</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Fitness Coach · Strength Coach · Performance Coach</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              I train clients for strength, body transformation, performance, and general fitness with structured programs and nutrition plans.
            </p>
            <div className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all"
              style={{
                background: selected === 'gym' ? '#f97316' : 'rgba(255,255,255,0.08)',
                color: selected === 'gym' ? '#fff' : 'rgba(255,255,255,0.60)',
              }}>
              {selected === 'gym' && saving ? 'Setting up…' : 'Select'}
            </div>
          </button>

          {/* Physiotherapist */}
          <button
            onClick={() => !saving && handleSelect('physio')}
            disabled={saving}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-200"
            style={{
              background: selected === 'physio' ? 'rgba(20,184,166,0.18)' : 'rgba(10,5,2,0.55)',
              borderColor: selected === 'physio' ? '#2dd4bf' : 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(16px)',
              boxShadow: selected === 'physio' ? '0 8px 32px rgba(20,184,166,0.25)' : '0 8px 32px rgba(0,0,0,0.4)',
              transform: selected === 'physio' ? 'scale(1.02)' : undefined,
            }}
          >
            <div className="text-5xl">🩺</div>
            <div>
              <p className="text-lg font-bold text-white">Physiotherapist</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Rehab Specialist · Occupational Therapist · Sports Therapist</p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              I assess and treat patients, prescribe rehabilitation programs, and guide recovery from injury or surgery.
            </p>
            <div className="mt-auto w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all"
              style={{
                background: selected === 'physio' ? '#14b8a6' : 'rgba(255,255,255,0.08)',
                color: selected === 'physio' ? '#fff' : 'rgba(255,255,255,0.60)',
              }}>
              {selected === 'physio' && saving ? 'Setting up…' : 'Select'}
            </div>
          </button>
        </div>

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          You can change this anytime from Settings → Configuration
        </p>
      </div>
    </div>
  );
}
