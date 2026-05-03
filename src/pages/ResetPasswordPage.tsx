import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { BrandTile } from '../components/Brand';
import {
  PASSWORD_PLACEHOLDER,
  cleanupPasswordError,
  validatePassword,
} from '../lib/passwordValidation';

export default function ResetPasswordPage() {
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const navigate       = useNavigate();

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking]     = useState(true);

  // Supabase sends the user here with a recovery token in the URL hash.
  // onAuthStateChange fires with event PASSWORD_RECOVERY once Supabase
  // exchanges that token for a valid session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
        setChecking(false);
      }
    });

    // Also check if there's already a valid session (e.g. page reload)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? cleanupPasswordError(err.message) : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  const inp = (
    <div className="lp-input-wrap relative flex items-center rounded-xl border border-white/12"
      style={{ background: 'rgba(255,255,255,0.06)' }} />
  );
  void inp;

  const cardStyle = { background: 'rgba(8,4,1,0.72)', boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)' };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">

      <style>{`
        @keyframes rp-card {
          0%   { opacity: 0; transform: translateY(24px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .rp-input-wrap { transition: box-shadow 0.2s ease, border-color 0.2s ease; }
        .rp-input-wrap:focus-within {
          box-shadow: 0 0 0 2px rgba(249,115,22,0.5), 0 0 24px rgba(249,115,22,0.20);
          border-color: rgba(249,115,22,0.65) !important;
        }
        .rp-input-wrap input:-webkit-autofill,
        .rp-input-wrap input:-webkit-autofill:hover,
        .rp-input-wrap input:-webkit-autofill:focus,
        .rp-input-wrap input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 9999px rgba(10,5,2,0.01) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
          transition: background-color 9999s ease-in-out 0s;
        }
        .rp-cta {
          background: linear-gradient(135deg, #f97316, #dc2626);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          box-shadow: 0 4px 20px rgba(249,115,22,0.40);
        }
        .rp-cta:hover:not(:disabled) { transform: scale(1.04); box-shadow: 0 8px 40px rgba(249,115,22,0.60); }
        .rp-cta:active:not(:disabled) { transform: scale(0.97); transition: transform 0.08s ease; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.42) 0%, rgba(6,3,1,0.80) 100%)' }} />
      <div className="absolute pointer-events-none" style={{ width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      <div className="relative w-full max-w-sm z-10" style={{ animation: 'rp-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <BrandTile className="w-16 h-16 rounded-2xl shadow-2xl" />
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">Full Range Lab</h1>
            <p className="text-sm font-semibold mt-1.5" style={{ color: 'rgba(253,186,116,0.75)' }}>
              All your clients, in one workspace
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8" style={cardStyle}>

          {checking ? (
            <p className="text-sm text-white/40 text-center py-4">Verifying reset link…</p>

          ) : done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>✅</div>
              <div>
                <p className="text-lg font-bold text-white">Password updated!</p>
                <p className="text-sm text-white/45 mt-1">Redirecting you to the app…</p>
              </div>
            </div>

          ) : !validSession ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>⚠️</div>
              <div>
                <p className="text-lg font-bold text-white">Link expired or invalid</p>
                <p className="text-sm text-white/45 mt-1">Please request a new password reset.</p>
              </div>
              <a href="/login" className="text-sm text-orange-300 hover:text-orange-200 hover:underline transition-colors font-semibold">
                Back to sign in
              </a>
            </div>

          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-xl font-bold text-white">Set new password</h2>
                <p className="text-sm text-white/40 mt-1.5">Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/65">New password</label>
                  <div className="rp-input-wrap relative flex items-center rounded-xl border border-white/12"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                    <input type={showPass ? 'text' : 'password'} required value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder={PASSWORD_PLACEHOLDER}
                      className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/65">Confirm password</label>
                  <div className="rp-input-wrap relative flex items-center rounded-xl border border-white/12"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                    <input type={showConf ? 'text' : 'password'} required value={confirm}
                      onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                    <button type="button" onClick={() => setShowConf(!showConf)}
                      className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5">
                      {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-300 bg-red-500/12 border border-red-400/25 rounded-xl px-4 py-3">{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="rp-cta w-full py-3.5 px-4 disabled:opacity-50 text-white text-sm font-bold rounded-xl tracking-wide">
                  {loading ? 'Updating…' : 'Update password →'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
