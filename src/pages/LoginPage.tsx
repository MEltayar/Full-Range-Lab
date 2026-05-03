import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BrandTile } from '../components/Brand';

export default function LoginPage() {
  const signIn         = useAuthStore((s) => s.signIn);
  const resetPassword  = useAuthStore((s) => s.resetPassword);
  const navigate       = useNavigate();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  // Forgot-password flow
  const [forgotMode, setForgotMode]       = useState(false);
  const [resetEmail, setResetEmail]       = useState('');
  const [resetSent, setResetSent]         = useState(false);
  const [resetLoading, setResetLoading]   = useState(false);
  const [resetError, setResetError]       = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password, remember);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">

      <style>{`
        @keyframes lp-card {
          0%   { opacity: 0; transform: translateY(28px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes lp-logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 8px 32px rgba(249,115,22,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 8px 48px rgba(249,115,22,0.65); }
        }
        @keyframes lp-overlay-shift {
          0%   { opacity: 1; }
          50%  { opacity: 0.88; }
          100% { opacity: 1; }
        }
        .lp-input-wrap {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .lp-input-wrap:focus-within {
          box-shadow: 0 0 0 2px rgba(249,115,22,0.5), 0 0 24px rgba(249,115,22,0.20);
          border-color: rgba(249,115,22,0.65) !important;
        }
        .lp-input-wrap input:-webkit-autofill,
        .lp-input-wrap input:-webkit-autofill:hover,
        .lp-input-wrap input:-webkit-autofill:focus,
        .lp-input-wrap input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 9999px rgba(10,5,2,0.01) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
          transition: background-color 9999s ease-in-out 0s;
        }
        .lp-card-text {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transform: translateZ(0);
        }
        .lp-cta {
          background: linear-gradient(135deg, #f97316, #dc2626);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          box-shadow: 0 4px 20px rgba(249,115,22,0.40);
        }
        .lp-cta:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 8px 40px rgba(249,115,22,0.60), 0 0 0 1px rgba(249,115,22,0.3);
        }
        .lp-cta:active:not(:disabled) {
          transform: scale(0.97);
          box-shadow: 0 2px 12px rgba(249,115,22,0.35);
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .lp-outline-btn {
          transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }
        .lp-outline-btn:hover {
          background: rgba(249,115,22,0.10);
          box-shadow: 0 0 20px rgba(249,115,22,0.15);
          transform: scale(1.01);
        }
      `}</style>

      {/* Background photo */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />

      {/* Vignette overlay — darker edges, lighter center so photo shows through */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 75% 85% at 50% 50%, rgba(6,3,1,0.42) 0%, rgba(6,3,1,0.80) 100%)',
        animation: 'lp-overlay-shift 12s ease-in-out infinite',
      }} />

      {/* Floating orange glow behind card */}
      <div className="absolute pointer-events-none" style={{
        width: '520px', height: '520px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.13) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      {/* Card */}
      <div className="relative w-full max-w-sm z-10" style={{ animation: 'lp-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="rounded-2xl overflow-hidden" style={{ animation: 'lp-logo-pulse 3s ease-in-out infinite' }}>
            <BrandTile className="w-16 h-16 rounded-2xl" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">Full Range Lab</h1>
            <p className="text-sm font-semibold mt-1.5" style={{ color: 'rgba(253,186,116,0.75)' }}>
              All your clients, in one workspace
            </p>
          </div>
        </div>

        {/* Glass card */}
        <div className="lp-card-text rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: 'rgba(8,4,1,0.72)', boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)' }}>

          {/* ── Forgot password panel ── */}
          {forgotMode ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-1">
                <button type="button" onClick={() => { setForgotMode(false); setResetSent(false); setResetError(''); }}
                  className="text-white/40 hover:text-white/70 transition-colors">
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white">Reset password</h2>
                  <p className="text-sm text-white/40 mt-0.5">We'll send a link to your email</p>
                </div>
              </div>

              {resetSent ? (
                <div className="text-center py-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>✉️</div>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Check your inbox at <strong className="text-white/90">{resetEmail}</strong>. Click the link to set a new password.
                  </p>
                  <button type="button" onClick={() => { setForgotMode(false); setResetSent(false); }}
                    className="text-xs text-orange-300/70 hover:text-orange-200 transition-colors mt-1">
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white/65">Email address</label>
                    <div className="lp-input-wrap relative flex items-center rounded-xl border border-white/12"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Mail size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                      <input type="email" required autoComplete="email" value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com"
                        className="w-full pl-9 pr-4 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                    </div>
                  </div>
                  {resetError && (
                    <p className="text-sm text-red-300 bg-red-500/12 border border-red-400/25 rounded-xl px-4 py-3">{resetError}</p>
                  )}
                  <button type="submit" disabled={resetLoading}
                    className="lp-cta w-full py-3.5 px-4 disabled:opacity-50 text-white text-sm font-bold rounded-xl tracking-wide">
                    {resetLoading ? 'Sending…' : 'Send reset link →'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* ── Sign in form ── */
            <>
              <div className="mb-7">
                <h2 className="text-xl font-bold text-white">Welcome back</h2>
                <p className="text-sm text-white/40 mt-1.5">Built for personal trainers & physiotherapists</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/65">Email</label>
                  <div className="lp-input-wrap relative flex items-center rounded-xl border border-white/12"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Mail size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                    <input type="email" required autoComplete="email" value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                      className="w-full pl-9 pr-4 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white/65">Password</label>
                  <div className="lp-input-wrap relative flex items-center rounded-xl border border-white/12"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                    <input type={showPass ? 'text' : 'password'} required autoComplete="current-password" value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between -mt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-orange-500" />
                    <span className="text-xs text-white/40">Remember me</span>
                  </label>
                  <button type="button" onClick={() => { setForgotMode(true); setResetEmail(email); }}
                    className="text-xs font-medium text-orange-300/60 hover:text-orange-200 transition-colors">
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-red-300 bg-red-500/12 border border-red-400/25 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading}
                  className="lp-cta w-full py-3.5 px-4 disabled:opacity-50 text-white text-sm font-bold rounded-xl tracking-wide">
                  {loading ? 'Signing in…' : 'Sign in →'}
                </button>

              </form>

              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-xs text-white/30">new here?</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <Link to="/signup"
                className="lp-outline-btn w-full py-3 px-4 rounded-xl border border-orange-400/35 text-orange-300 text-sm font-semibold text-center block mt-3">
                Create a free account
              </Link>
            </>
          )}
        </div>

        {/* Pricing link */}
        {!forgotMode && (
          <div className="flex items-center justify-center mt-4">
            <Link to="/pricing"
              className="text-sm font-medium text-orange-300/70 hover:text-orange-200 transition-colors underline underline-offset-4">
              View pricing & plans
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
