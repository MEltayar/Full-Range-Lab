import { useState } from 'react';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useClientPortalStore } from '../../../store/clientPortalStore';
import {
  PASSWORD_PLACEHOLDER,
  cleanupPasswordError,
  validatePassword,
} from '../../../lib/passwordValidation';

export default function ClientSetPasswordPage() {
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const linkedClient   = useClientPortalStore((s) => s.linkedClient);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Live checklist mirrors validatePassword().
  const lenOk     = password.length >= 10;
  const lowerOk   = /[a-z]/.test(password);
  const upperOk   = /[A-Z]/.test(password);
  const numberOk  = /[0-9]/.test(password);
  const matches   = password.length > 0 && password === confirm;
  const canSave   = lenOk && lowerOk && upperOk && numberOk && matches && !saving;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr)    { setError(pwErr); return; }
    if (!matches) { setError("Passwords don't match."); return; }
    setError('');
    setSaving(true);
    try {
      await updatePassword(password);
      // onAuthStateChange will refresh the user object — ClientProtectedRoute will see
      // user_metadata.password_set === true and unmount this page automatically.
    } catch (err) {
      setError(err instanceof Error ? cleanupPasswordError(err.message) : 'Could not save password.');
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">

      <style>{`
        @keyframes csp-card {
          0%   { opacity: 0; transform: translateY(28px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes csp-logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 8px 32px rgba(249,115,22,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 8px 48px rgba(249,115,22,0.65); }
        }
        .csp-input-wrap {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .csp-input-wrap:focus-within {
          box-shadow: 0 0 0 2px rgba(249,115,22,0.5), 0 0 24px rgba(249,115,22,0.20);
          border-color: rgba(249,115,22,0.65) !important;
        }
        .csp-input-wrap input:-webkit-autofill,
        .csp-input-wrap input:-webkit-autofill:hover,
        .csp-input-wrap input:-webkit-autofill:focus,
        .csp-input-wrap input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 9999px rgba(10,5,2,0.01) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
          transition: background-color 9999s ease-in-out 0s;
        }
        .csp-cta {
          background: linear-gradient(135deg, #f97316, #dc2626);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          box-shadow: 0 4px 20px rgba(249,115,22,0.40);
        }
        .csp-cta:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 8px 40px rgba(249,115,22,0.60), 0 0 0 1px rgba(249,115,22,0.3);
        }
        .csp-cta:active:not(:disabled) {
          transform: scale(0.97);
          box-shadow: 0 2px 12px rgba(249,115,22,0.35);
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
      `}</style>

      {/* Shared site background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.42) 0%, rgba(6,3,1,0.80) 100%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        width: '520px', height: '520px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      {/* Card */}
      <div className="relative w-full max-w-sm z-10" style={{ animation: 'csp-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', animation: 'csp-logo-pulse 3s ease-in-out infinite' }}>
            <Lock size={26} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">
              Welcome{linkedClient ? `, ${linkedClient.name.split(/\s+/)[0]}` : ''}
            </h1>
            <p className="text-sm font-semibold mt-1.5" style={{ color: 'rgba(253,186,116,0.75)' }}>
              Set a password to keep your access.
            </p>
          </div>
        </div>

        {/* Glass card */}
        <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: 'rgba(8,4,1,0.72)', boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)' }}>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">

            {/* New password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/65">New password</label>
              <div className="csp-input-wrap relative flex items-center rounded-xl border border-white/12"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={PASSWORD_PLACEHOLDER}
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/65">Confirm password</label>
              <div className="csp-input-wrap relative flex items-center rounded-xl border border-white/12"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                <input
                  type={showConf ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  placeholder="Type it again"
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConf((v) => !v)}
                  className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5"
                  aria-label={showConf ? 'Hide password' : 'Show password'}
                >
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Live rules */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              {[
                { ok: lenOk,    label: 'At least 10 characters' },
                { ok: lowerOk,  label: 'A lowercase letter' },
                { ok: upperOk,  label: 'An uppercase letter' },
                { ok: numberOk, label: 'A number' },
                { ok: matches,  label: 'Both fields match' },
              ].map((r) => (
                <li key={r.label} className="flex items-center gap-1.5">
                  <Check size={12} className={r.ok ? 'text-emerald-400' : 'text-white/25'} />
                  <span className={r.ok ? 'text-white/80' : 'text-white/40'}>{r.label}</span>
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/12 border border-red-400/25 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSave}
              className="csp-cta w-full py-3.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl tracking-wide"
            >
              {saving ? 'Saving…' : 'Set password & continue →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
