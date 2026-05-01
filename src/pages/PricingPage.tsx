import { useEffect, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePlanStore } from '../store/planStore';
import { usePaymentProofStore } from '../store/paymentProofStore';
import { BrandTile } from '../components/Brand';
import ProofForm from '../components/ProofForm';
import { CONTACT_NUMBER, whatsappLink } from '../lib/paymentConfig';

function seeded(n: number) { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); }

const GYM_ICONS = [
  '🏋️', '🏋️‍♂️', '💪', '🥊', '🥋', '🏅', '🎽',
  '⚡', '🔥', '🏆', '🥇', '🧘‍♂️', '🏃‍♂️', '🦾',
  '🩺', '❤️‍🔥', '🏇', '🤸‍♂️', '🚴‍♂️', '🧗‍♂️',
];

const trialFeatures = [
  '2 clients',
  '1 program per client',
  'Exercise library (view only)',
  'Program builder',
];

const monthlyFeatures = [
  'Unlimited clients & programs',
  'Full exercise library + custom exercises',
  'PDF export',
  'Diet plans & food library',
  'Branded client portal — up to 30 invites',
  'Clinic branding & configuration',
  'Save custom templates',
];

const yearlyFeatures = [
  'Unlimited clients & programs',
  'Full exercise library + custom exercises',
  'PDF export',
  'Diet plans & food library',
  'Branded client portal — unlimited invites',
  'Clinic branding & configuration',
  'Save custom templates',
  'Excel export',
  'WhatsApp & Email sharing',
  'Client analytics',
  'Export sheet templates',
];

const yearlyExclusiveIds = new Set([
  'Branded client portal — unlimited invites',
  'Excel export',
  'WhatsApp & Email sharing',
  'Client analytics',
  'Export sheet templates',
]);

export default function PricingPage() {
  const user = useAuthStore((s) => s.user);
  const subscription = usePlanStore((s) => s.subscription);
  const currentPlan = subscription?.plan ?? 'trial';

  const myProofs     = usePaymentProofStore((s) => s.myProofs);
  const loadMyProofs = usePaymentProofStore((s) => s.loadMine);
  const submitProof  = usePaymentProofStore((s) => s.submit);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => { if (user) void loadMyProofs(); }, [user, loadMyProofs]);

  const pendingProof = myProofs.find((p) => p.status === 'pending');
  const lastRejected = myProofs.find((p) => p.status === 'rejected');
  const isOnPaidPlan = currentPlan === 'pro_monthly' || currentPlan === 'pro_yearly';

  const fallers = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    icon: GYM_ICONS[i % GYM_ICONS.length],
    left: `${seeded(i * 3 + 4) * 100}%`,
    size: `${18 + seeded(i * 7 + 4) * 24}px`,
    duration: `${7 + seeded(i * 5 + 4) * 9}s`,
    delay: `${seeded(i * 11 + 4) * 12}s`,
    opacity: 0.50 + seeded(i * 13 + 4) * 0.35,
  }));

  const cardBase: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-14 overflow-hidden relative">

      <style>{`
        @keyframes pp-fall {
          0%   { transform: translateY(-70px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
        @keyframes pp-in {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .pp-cta {
          background: linear-gradient(135deg, #f97316, #dc2626);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          box-shadow: 0 4px 20px rgba(249,115,22,0.40);
        }
        .pp-cta:hover { transform: scale(1.03); box-shadow: 0 8px 36px rgba(249,115,22,0.55); }
        .pp-cta:active { transform: scale(0.97); }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1600&q=80&fit=crop')`, filter: 'brightness(0.72)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 90% at 50% 50%, rgba(6,3,1,0.45) 0%, rgba(6,3,1,0.85) 100%)' }} />
      <div className="absolute pointer-events-none" style={{ width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

      {/* Falling icons */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        {fallers.map((f) => (
          <span key={f.id} style={{
            position: 'absolute', top: '-70px', left: f.left,
            fontSize: f.size, opacity: f.opacity, userSelect: 'none',
            animation: `pp-fall ${f.duration} ${f.delay} infinite linear`,
          }}>{f.icon}</span>
        ))}
      </div>

      {/* Content */}
      <div className="relative w-full max-w-4xl z-10" style={{ animation: 'pp-in 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-5">
            <BrandTile className="w-14 h-14 rounded-2xl shadow-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-3 text-base font-medium" style={{ color: 'rgba(253,186,116,0.70)' }}>
            Start free for 14 days — no credit card required.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Free Trial */}
          <div className="rounded-2xl border border-white/10 p-6 flex flex-col" style={{ ...cardBase, background: 'rgba(10,5,2,0.60)' }}>
            <div className="mb-5">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Free Trial</p>
              <p className="text-4xl font-black text-white mt-2">Free</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>14 days · no card needed</p>
            </div>
            <ul className="flex flex-col gap-2.5 flex-1 mb-6">
              {trialFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>
                  <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
              {monthlyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm line-through" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  <Lock size={12} className="mt-0.5 shrink-0 opacity-40" />
                  {f}
                </li>
              ))}
            </ul>
            {currentPlan === 'trial' ? (
              <div className="w-full text-center py-2.5 text-sm font-semibold rounded-xl border"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.50)', background: 'rgba(255,255,255,0.05)' }}>
                Current plan
              </div>
            ) : (
              <div className="w-full text-center py-2.5 text-sm rounded-xl" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Expired after 14 days
              </div>
            )}
          </div>

          {/* Pro Monthly — highlighted */}
          <div className="rounded-2xl border-2 p-6 flex flex-col" style={{ ...cardBase, background: 'rgba(249,115,22,0.12)', borderColor: '#f97316', boxShadow: '0 24px 64px rgba(249,115,22,0.25)' }}>
            <div className="mb-5">
              <span className="inline-block text-xs font-black px-2.5 py-1 rounded-full text-white mb-3"
                style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>
                Most Popular
              </span>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fb923c' }}>Pro Monthly</p>
              <div className="flex items-end gap-1.5 mt-2">
                <p className="text-4xl font-black text-white">500</p>
                <p className="text-lg font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.50)' }}>EGP</p>
              </div>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.40)' }}>per month</p>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1 mb-6">
              {monthlyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  <Check size={14} className="text-orange-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
              {/* Yearly-exclusive features shown as locked */}
              {['Excel export', 'WhatsApp & Email sharing', 'Client analytics', 'Export sheet templates'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm line-through" style={{ color: 'rgba(255,255,255,0.20)' }}>
                  <Lock size={12} className="mt-0.5 shrink-0 opacity-40" />
                  {f}
                </li>
              ))}
            </ul>
            {currentPlan === 'pro_monthly' ? (
              <div className="w-full text-center py-2.5 text-sm font-semibold rounded-xl border"
                style={{ borderColor: 'rgba(249,115,22,0.4)', color: '#fb923c', background: 'rgba(249,115,22,0.10)' }}>
                Current plan
              </div>
            ) : (
              <a href={whatsappLink('Pro Monthly (500 EGP/month)')} target="_blank" rel="noopener noreferrer"
                className="pp-cta w-full text-center py-2.5 text-white text-sm font-bold rounded-xl block">
                Contact to upgrade →
              </a>
            )}
          </div>

          {/* Pro Yearly */}
          <div className="rounded-2xl border border-emerald-400/30 p-6 flex flex-col" style={{ ...cardBase, background: 'rgba(10,5,2,0.60)' }}>
            <div className="mb-5">
              <span className="inline-block text-xs font-black px-2.5 py-1 rounded-full text-white bg-emerald-500 mb-3">
                Best Value · Elite Features
              </span>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Pro Yearly</p>
              <div className="flex items-end gap-1.5 mt-2">
                <p className="text-4xl font-black text-white">4,000</p>
                <p className="text-lg font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.50)' }}>EGP</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.30)' }}>6,000 EGP/yr</p>
                <p className="text-xs font-semibold text-emerald-400">2 months free!</p>
              </div>
            </div>

            <ul className="flex flex-col gap-2.5 flex-1 mb-6">
              {yearlyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: yearlyExclusiveIds.has(f) ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.70)' }}>
                  <Check size={14} className={yearlyExclusiveIds.has(f) ? 'text-emerald-400 mt-0.5 shrink-0' : 'text-emerald-400/60 mt-0.5 shrink-0'} />
                  <span>
                    {f}
                    {yearlyExclusiveIds.has(f) && (
                      <span className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wide">Yearly</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {currentPlan === 'pro_yearly' ? (
              <div className="w-full text-center py-2.5 text-sm font-semibold rounded-xl border"
                style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.50)', background: 'rgba(255,255,255,0.05)' }}>
                Current plan
              </div>
            ) : (
              <a href={whatsappLink('Pro Yearly (4,000 EGP/year)')} target="_blank" rel="noopener noreferrer"
                className="pp-cta w-full text-center py-2.5 text-white text-sm font-bold rounded-xl block">
                Contact to upgrade →
              </a>
            )}
          </div>
        </div>

        {/* How to pay */}
        <div className="mt-8 rounded-2xl border border-white/10 p-7" style={{ ...cardBase, background: 'rgba(10,5,2,0.60)' }}>
          <h2 className="text-base font-bold text-white mb-4">How to pay</h2>
          <ol className="flex flex-col gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>1</span>
              Choose a plan above and tap <strong className="text-white/80 ml-1">Contact to upgrade</strong>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>2</span>
              <span>Send payment via <strong className="text-white/80">InstaPay</strong> or <strong className="text-white/80">Vodafone Cash</strong> to <strong className="text-white/80 block mt-0.5">{CONTACT_NUMBER}</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>3</span>
              <span>Upload the receipt screenshot below — or send it to us on WhatsApp</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)' }}>4</span>
              We'll activate your account within a few hours
            </li>
          </ol>
        </div>

        {/* Upload payment receipt — self-serve alternative to WhatsApp */}
        {user && !isOnPaidPlan && (
          <div className="mt-6 rounded-2xl border border-white/10 p-7" style={{ ...cardBase, background: 'rgba(10,5,2,0.60)' }}>
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-white">Upload payment receipt</h2>
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,0.40)' }}>
                Self-serve
              </span>
            </div>

            {pendingProof ? (
              <div className="text-left rounded-xl border border-amber-400/30 p-4"
                style={{ background: 'rgba(245,158,11,0.10)' }}>
                <p className="text-xs font-semibold text-amber-300 mb-1">Receipt received — under review</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Submitted {new Date(pendingProof.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.
                  We usually activate within a few hours.
                </p>
              </div>
            ) : showForm ? (
              <ProofForm
                onCancel={() => setShowForm(false)}
                onSubmit={async (args) => { await submitProof(args); setShowForm(false); }}
              />
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Already paid? Attach the transfer screenshot here and we'll activate your account.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="pp-cta w-full text-center py-2.5 text-white text-sm font-bold rounded-xl">
                  Upload receipt
                </button>
              </>
            )}

            {lastRejected && !pendingProof && !showForm && (
              <p className="text-[11px] leading-relaxed mt-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Last submission was rejected{lastRejected.adminNotes ? ` — ${lastRejected.adminNotes}` : '.'} Try again with a clearer receipt.
              </p>
            )}
          </div>
        )}

        {/* CTA button */}
        <div className="text-center mt-10">
          {user ? (
            <Link to="/"
              className="pp-cta inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-sm font-bold">
              Go to Dashboard →
            </Link>
          ) : (
            <Link to="/signup"
              className="pp-cta inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white text-sm font-bold">
              Start free trial →
            </Link>
          )}
          {user && (
            <p className="mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Already subscribed? Your plan is active above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
