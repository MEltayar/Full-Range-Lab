import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BrandTile } from '../components/Brand';
import {
  PASSWORD_PLACEHOLDER,
  cleanupPasswordError,
  validatePassword,
} from '../lib/passwordValidation';

export default function SignupPage() {
  const signUp = useAuthStore((s) => s.signUp);
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [agreed, setAgreed]     = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!agreed) { setError('Please agree to the Terms and Privacy Policy to continue'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { setError(pwErr); return; }
    setLoading(true);
    try {
      const { needsConfirmation } = await signUp(email, password);
      if (needsConfirmation) { setNeedsConfirmation(true); } else { navigate('/onboarding'); }
    } catch (err: unknown) {
      setError(err instanceof Error ? cleanupPasswordError(err.message) : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  const sharedBg = (
    <>
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
    </>
  );

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {sharedBg}
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6" style={{ animation: 'sp-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          <style>{`@keyframes sp-card { 0% { opacity:0; transform:translateY(28px) scale(0.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }`}</style>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 8px 32px rgba(249,115,22,0.5)' }}>
            <span className="text-2xl">✉️</span>
          </div>
          <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8 text-center w-full"
            style={{ background: 'rgba(8,4,1,0.72)', boxShadow: '0 32px 80px rgba(0,0,0,0.65)' }}>
            <h2 className="text-xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-sm text-white/55 leading-relaxed">
              We sent a confirmation link to{' '}
              <strong className="text-white/90">{email}</strong>.
              <br />Click it to activate your account.
            </p>
          </div>
          <p className="text-sm text-white/35">
            Already confirmed?{' '}
            <Link to="/login" className="text-orange-300 hover:text-orange-200 hover:underline font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">

      <style>{`
        @keyframes sp-card {
          0%   { opacity: 0; transform: translateY(28px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes sp-logo-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0), 0 8px 32px rgba(249,115,22,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(249,115,22,0.08), 0 8px 48px rgba(249,115,22,0.65); }
        }
        .sp-input-wrap {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .sp-input-wrap:focus-within {
          box-shadow: 0 0 0 2px rgba(249,115,22,0.5), 0 0 24px rgba(249,115,22,0.20);
          border-color: rgba(249,115,22,0.65) !important;
        }
        .sp-input-wrap input:-webkit-autofill,
        .sp-input-wrap input:-webkit-autofill:hover,
        .sp-input-wrap input:-webkit-autofill:focus,
        .sp-input-wrap input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 9999px rgba(10,5,2,0.01) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
          transition: background-color 9999s ease-in-out 0s;
        }
        .sp-cta {
          background: linear-gradient(135deg, #f97316, #dc2626);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          box-shadow: 0 4px 20px rgba(249,115,22,0.40);
        }
        .sp-cta:hover:not(:disabled) {
          transform: scale(1.04);
          box-shadow: 0 8px 40px rgba(249,115,22,0.60), 0 0 0 1px rgba(249,115,22,0.3);
        }
        .sp-cta:active:not(:disabled) {
          transform: scale(0.97);
          box-shadow: 0 2px 12px rgba(249,115,22,0.35);
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .sp-outline-btn {
          transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }
        .sp-outline-btn:hover {
          background: rgba(249,115,22,0.10);
          box-shadow: 0 0 20px rgba(249,115,22,0.15);
          transform: scale(1.01);
        }
      `}</style>

      {sharedBg}

      {/* Card */}
      <div className="relative w-full max-w-sm z-10" style={{ animation: 'sp-card 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Brand */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="rounded-2xl overflow-hidden" style={{ animation: 'sp-logo-pulse 3s ease-in-out infinite' }}>
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
        <div className="rounded-2xl border border-white/10 backdrop-blur-2xl p-8"
          style={{ background: 'rgba(8,4,1,0.72)', boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)' }}>

          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">Create your account</h2>
            <p className="text-sm text-white/40 mt-1.5">Built for personal trainers & physiotherapists</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/65">Email</label>
              <div className="sp-input-wrap relative flex items-center rounded-xl border border-white/12"
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
              <div className="sp-input-wrap relative flex items-center rounded-xl border border-white/12"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} required autoComplete="new-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder={PASSWORD_PLACEHOLDER}
                  className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-white/65">Confirm password</label>
              <div className="sp-input-wrap relative flex items-center rounded-xl border border-white/12"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Lock size={15} className="absolute left-3.5 text-white/30 shrink-0 pointer-events-none" />
                <input type={showConf ? 'text' : 'password'} required autoComplete="new-password" value={confirm}
                  onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 text-sm bg-transparent text-white placeholder-white/25 focus:outline-none" />
                <button type="button" onClick={() => setShowConf(!showConf)}
                  className="absolute right-3 text-white/30 hover:text-white/65 transition-colors p-0.5">
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Terms agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none -mt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-0 cursor-pointer accent-orange-500"
              />
              <span className="text-xs text-white/55 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="text-orange-300 hover:text-orange-200 underline underline-offset-2">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" className="text-orange-300 hover:text-orange-200 underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-300 bg-red-500/12 border border-red-400/25 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Primary CTA */}
            <button type="submit" disabled={loading || !agreed}
              className="sp-cta w-full py-3.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl tracking-wide">
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          {/* Divider + Sign in — outside form to avoid double-click */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/30">have an account?</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
          <Link to="/login"
            className="sp-outline-btn w-full py-3 px-4 rounded-xl border border-orange-400/35 text-orange-300 text-sm font-semibold text-center block mt-3">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
}
