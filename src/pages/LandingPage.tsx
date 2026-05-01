import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, BarChart3, Camera, ClipboardList, Dumbbell,
  FileText, Layers, Palette, PlayCircle,
  Salad, Send, ShieldCheck, Smartphone, Sparkles, Stethoscope, Target, Users, User,
  Zap,
} from 'lucide-react';
import { BrandTile } from '../components/Brand';

const SHOTS = {
  dashboard:        '/landing/dashboard.png',
  clientsList:      '/landing/clients-list.png',
  addClient:        '/landing/add-client.png',
  clientOverview:   '/landing/client-overview.png',
  clientProfile:    '/landing/client-profile.png',
  clientCheckin:    '/landing/client-checkin.png',
  bodyMetrics:      '/landing/body-metrics.png',
  progressPhotos:   '/landing/progress-photos.png',
  clientPlans:      '/landing/client-plans.png',
  exerciseLibrary:  '/landing/exercise-library.png',
  exerciseVideo:    '/landing/exercise-video.png',
  addExercise:      '/landing/add-exercise.png',
  programsList:     '/landing/programs-list.png',
  programPicker:    '/landing/program-picker.png',
  programBuilder:   '/landing/program-builder.png',
  foodLibrary:      '/landing/food-library.png',
  addFood:          '/landing/add-food.png',
  dietBuilder:      '/landing/diet-builder.png',
  configTrainer:    '/landing/config-trainer.png',
  configTemplates:  '/landing/config-templates.png',
  exportTemplates:  '/landing/export-templates.png',
  portalToday:        '/landing/portal-today.png',
  portalMeals:        '/landing/portal-meals.png',
  portalTraining:     '/landing/portal-training.png',
  portalDiet:         '/landing/portal-diet.png',
  portalProfile:      '/landing/portal-profile.png',
  portalMeasurements: '/landing/portal-measurements.png',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background: '#070A12' }}>
      <GlobalStyles />
      <BackgroundFX />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        <ClientsFeature />
        <Client360 />
        <ExerciseLibraryFeature />
        <ProgramBuilderFeature />
        <DietFeature />
        <BrandingFeature />
        <ClientPortalCallout />
        <PricingTeaser />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ───────────────────── styles ───────────────────── */

function GlobalStyles() {
  return (
    <style>{`
      @keyframes lp-fade-up { 0% { opacity: 0; transform: translateY(28px); } 100% { opacity: 1; transform: translateY(0); } }
      @keyframes lp-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes lp-glow-breath { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.85; } }
      @keyframes lp-pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.7; } }
      @keyframes lp-pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(2.4); opacity: 0; } }
      @keyframes lp-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      @keyframes lp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes lp-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes lp-tilt-in { 0% { opacity: 0; transform: perspective(1200px) rotateX(8deg) translateY(40px); } 100% { opacity: 1; transform: perspective(1200px) rotateX(0) translateY(0); } }

      .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
      .reveal[data-visible="true"] { opacity: 1; transform: translateY(0); }

      .lp-cta {
        background: linear-gradient(135deg, #f97316, #dc2626);
        transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
        box-shadow: 0 4px 20px rgba(249,115,22,0.40);
      }
      .lp-cta:hover { transform: scale(1.04); box-shadow: 0 8px 40px rgba(249,115,22,0.60); }
      .lp-cta:active { transform: scale(0.97); }

      .lp-outline {
        transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
      }
      .lp-outline:hover { background: rgba(249,115,22,0.08); border-color: rgba(249,115,22,0.45); transform: translateY(-1px); }

      .lp-card {
        background: rgba(255,255,255,0.035);
        border: 1px solid rgba(255,255,255,0.07);
        transition: border-color 0.25s ease, transform 0.25s ease, background 0.25s ease;
      }
      .lp-card:hover {
        border-color: rgba(249,115,22,0.35);
        background: rgba(255,255,255,0.055);
        transform: translateY(-2px);
      }

      .lp-tilt {
        transition: transform 0.6s cubic-bezier(0.16,1,0.3,1), box-shadow 0.6s cubic-bezier(0.16,1,0.3,1);
      }
      .lp-tilt:hover {
        transform: perspective(1200px) rotateX(-1.5deg) rotateY(1.5deg) scale(1.01);
      }

      .lp-shimmer {
        background: linear-gradient(110deg, transparent 35%, rgba(249,115,22,0.18) 50%, transparent 65%);
        background-size: 200% 100%;
        animation: lp-shimmer 4s ease-in-out infinite;
      }

      .lp-pill {
        background: rgba(249,115,22,0.10);
        border: 1px solid rgba(249,115,22,0.28);
        backdrop-filter: blur(8px);
      }

      .lp-anno {
        background: rgba(15,8,3,0.92);
        border: 1px solid rgba(249,115,22,0.35);
        backdrop-filter: blur(12px);
        box-shadow: 0 12px 40px rgba(0,0,0,0.45);
        animation: lp-float 6s ease-in-out infinite;
      }

      /* Pulsing dot used to point at parts of the screenshots */
      .lp-dot { position: relative; }
      .lp-dot::before {
        content: ''; position: absolute; inset: 0;
        border-radius: 9999px;
        background: rgba(249,115,22,0.6);
        animation: lp-pulse-ring 1.8s ease-out infinite;
      }

      /* Soft brand-orange halo behind a screenshot — sells the "embedded" feel */
      .lp-shot-wrap { position: relative; }
      .lp-shot-halo {
        position: absolute;
        inset: -10% -8% -14% -8%;
        pointer-events: none;
        background:
          radial-gradient(ellipse 55% 50% at 50% 50%, rgba(249,115,22,0.32) 0%, rgba(249,115,22,0.08) 45%, transparent 75%),
          radial-gradient(ellipse 70% 35% at 50% 100%, rgba(220,38,38,0.18) 0%, transparent 70%);
        filter: blur(28px);
        z-index: 0;
        animation: lp-glow-breath 9s ease-in-out infinite;
      }
      .lp-shot-frame {
        position: relative;
        z-index: 1;
      }
      /* Bottom edge fade: blends the bright screenshot into the dark page */
      .lp-shot-edge {
        position: absolute;
        inset: auto 0 0 0;
        height: 26%;
        pointer-events: none;
        background: linear-gradient(180deg,
          transparent 0%,
          rgba(7,10,18,0.18) 55%,
          rgba(7,10,18,0.42) 100%);
      }
      /* Subtle inner-ring on the screenshot panel so it reads as a window, not a clip */
      .lp-shot-frame::after {
        content: '';
        position: absolute;
        inset: 36px 0 0 0;
        pointer-events: none;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
        border-radius: 0 0 12px 12px;
      }
    `}</style>
  );
}

/* ───────────────────── reveal-on-scroll hook ───────────────────── */

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).dataset.visible = 'true';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ───────────────────── background ───────────────────── */

function BackgroundFX() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-[1000px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249,115,22,0.18) 0%, transparent 60%)',
        animation: 'lp-glow-breath 9s ease-in-out infinite',
      }} />
      <div className="absolute inset-x-0 top-[600px] h-[800px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 50% at 80% 30%, rgba(220,38,38,0.10) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-x-0 top-[1500px] h-[800px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 50% at 20% 30%, rgba(56,189,248,0.06) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 95%)',
      }} />
    </>
  );
}

/* ───────────────────── nav ───────────────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(7,10,18,0.78)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <BrandTile className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-lg shrink-0" />
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-bold tracking-tight truncate">Full Range Lab</div>
            <div className="hidden sm:block text-[11px] text-orange-300/70 -mt-0.5 font-semibold">Move better. Train smarter.</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <a href="#features" className="hidden md:inline-block text-sm text-white/55 hover:text-white px-3 py-2 transition-colors">Features</a>
          <a href="#client-portal" className="hidden md:inline-block text-sm text-white/55 hover:text-white px-3 py-2 transition-colors">Client portal</a>
          <Link to="/pricing" className="hidden sm:inline-block text-sm text-white/55 hover:text-white px-3 py-2 transition-colors">Pricing</Link>
          <Link to="/login"
            className="text-xs sm:text-sm whitespace-nowrap text-white/85 hover:text-white px-3 sm:px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="lp-cta text-xs sm:text-sm whitespace-nowrap font-semibold px-3 sm:px-4 py-2 rounded-lg text-white">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ───────────────────── hero ───────────────────── */

function Hero() {
  return (
    <section className="px-5 sm:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16 max-w-7xl mx-auto text-center">
      <div className="lp-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
        style={{ animation: 'lp-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
        <span className="lp-dot w-1.5 h-1.5 rounded-full bg-orange-400" />
        <Sparkles size={12} className="text-orange-300" />
        <span className="text-xs font-semibold text-orange-200">14-day free trial — no card required</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto"
        style={{ animation: 'lp-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.05s' }}>
        The complete training studio
        <span className="block mt-2"
          style={{ background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          for physiotherapists & elite trainers
        </span>
      </h1>

      <p className="text-base sm:text-lg text-white/55 mt-6 max-w-2xl mx-auto leading-relaxed"
        style={{ animation: 'lp-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.12s' }}>
        Build training programs and diet plans, manage every client, export branded PDFs, and give each client their own private mobile portal — all in one place.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9"
        style={{ animation: 'lp-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.18s' }}>
        <Link to="/signup" className="lp-cta inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white">
          Start your free trial <ArrowRight size={16} />
        </Link>
        <a href="#features" className="lp-outline inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-semibold text-white/85 border border-white/15">
          See it in action
        </a>
      </div>

      {/* Hero screenshot with floating annotations */}
      <div className="relative mt-16 sm:mt-24" style={{ animation: 'lp-tilt-in 1.2s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0.25s' }}>
        <div className="absolute -inset-x-12 -inset-y-12 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(249,115,22,0.22) 0%, transparent 70%)',
          animation: 'lp-glow-breath 7s ease-in-out infinite',
        }} />
        <BrowserFrame title="Full Range Lab — Dashboard" url="fullrangelab.com/dashboard">
          <img src={SHOTS.dashboard} alt="Trainer dashboard"
            className="block w-full h-auto select-none" draggable={false} />
        </BrowserFrame>

        {/* Annotations */}
        <Annotation pos={{ top: '8%', left: '-8%' }} hideOn="lg" extraStyle={{ animationDelay: '0.5s' }}>
          <AnnoIcon><Users size={14} /></AnnoIcon>
          <span>Total clients at a glance</span>
        </Annotation>
        <Annotation pos={{ top: '20%', right: '-10%' }} hideOn="lg" extraStyle={{ animationDelay: '0.9s' }}>
          <AnnoIcon><Activity size={14} /></AnnoIcon>
          <span>Active programs &amp; templates</span>
        </Annotation>
        <Annotation pos={{ bottom: '6%', left: '-6%' }} hideOn="lg" extraStyle={{ animationDelay: '1.2s' }}>
          <AnnoIcon><Sparkles size={14} /></AnnoIcon>
          <span>Recent activity, ranked</span>
        </Annotation>
      </div>
    </section>
  );
}

/* ───────────────────── marquee ───────────────────── */

function Marquee() {
  const items = [
    { icon: Stethoscope, label: 'Built for physiotherapists' },
    { icon: Dumbbell,    label: 'Built for personal trainers' },
    { icon: ShieldCheck, label: 'Your data, your branding' },
    { icon: Smartphone,  label: 'Mobile-first client portal' },
    { icon: FileText,    label: 'PDF & Excel export' },
    { icon: Salad,       label: 'Built-in diet planner' },
    { icon: Camera,      label: 'Progress photos & check-ins' },
    { icon: Layers,      label: 'Reusable program templates' },
  ];
  const Track = () => (
    <>
      {items.map(({ icon: Icon, label }, i) => (
        <div key={`${label}-${i}`} className="flex items-center gap-3 px-6 shrink-0">
          <Icon size={15} className="text-orange-400" />
          <span className="text-sm font-medium text-white/55 whitespace-nowrap">{label}</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
        </div>
      ))}
    </>
  );
  return (
    <section className="border-y border-white/5 mt-2 mb-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))' }}>
      <div className="flex py-5" style={{ animation: 'lp-marquee 38s linear infinite', width: 'max-content' }}>
        <Track />
        <Track />
      </div>
    </section>
  );
}

/* ───────────────────── feature: clients ───────────────────── */

function ClientsFeature() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="features" className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Clients"
        title="Every client, in one calm place"
        desc="Build a roster, capture intake details, and keep medical history, food preferences, and exercise dislikes side-by-side with the program you wrote for them."
      />
      <div ref={ref} className="reveal grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mt-14">
        <div className="space-y-3">
          <FeatureBullet icon={Users} title="Searchable roster" desc="Stats, status, programs — all visible without opening anything." />
          <FeatureBullet icon={Sparkles} title="Recently-active dot" desc="Spot who's been logging check-ins or photos in the last 7 days." />
          <FeatureBullet icon={ClipboardList} title="One-click intake" desc="Capture name, body metrics, goal, and a private message to the client in 30 seconds." />
        </div>
        <div className="relative">
          <BrowserFrame title="Clients" url="fullrangelab.com/clients">
            <img src={SHOTS.clientsList} alt="Clients list" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
          {/* Floating Add Client modal */}
          <div className="absolute -bottom-8 -right-4 sm:-right-12 w-[58%] hidden sm:block"
            style={{ animation: 'lp-float 7s ease-in-out infinite' }}>
            <BrowserFrame compact title="Add Client" tone="modal">
              <img src={SHOTS.addClient} alt="Add client" className="block w-full h-auto" draggable={false} />
            </BrowserFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── feature: client 360 (rotating tabs) ───────────────────── */

function Client360() {
  const tabs = [
    { id: 'overview', label: 'Overview',       icon: Activity,   img: SHOTS.clientOverview, desc: 'See the client\'s training plans, diet plans, check-ins, subscription window, and a live activity timeline — all from a single screen.' },
    { id: 'profile',  label: 'Profile & Notes', icon: ClipboardList, img: SHOTS.clientProfile,  desc: 'Trainer-only notes for medical history, allergies, food and exercise preferences. Never shown to the client.' },
    { id: 'body',     label: 'Body & Photos',   icon: BarChart3,  img: SHOTS.bodyMetrics,    desc: 'Weight, body fat, muscle, waist, chest, hip, thigh, arm — with deltas vs. last check-in and weekly mood capture.' },
    { id: 'photos',   label: 'Progress Photos', icon: Camera,     img: SHOTS.progressPhotos, desc: 'Front, side, back, custom poses. Automatic timestamps for clean before/after comparisons.' },
    { id: 'plans',    label: 'Plans',           icon: Layers,     img: SHOTS.clientPlans,    desc: 'Active and past training and diet plans grouped together — assign new ones, retire old ones, see what\'s in flight.' },
  ];
  const [active, setActive] = useState(tabs[0].id);
  const ref = useReveal<HTMLDivElement>();

  // Auto-advance tabs while idle
  const userTouched = useRef(false);
  useEffect(() => {
    if (userTouched.current) return;
    const id = setInterval(() => {
      if (userTouched.current) return;
      setActive((cur) => {
        const i = tabs.findIndex((t) => t.id === cur);
        return tabs[(i + 1) % tabs.length].id;
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Client 360°"
        title="The full picture in one click"
        desc="Tab through everything you need to know about a client without leaving the page. Click a tab below to peek at each one."
      />

      <div ref={ref} className="reveal mt-14">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => { userTouched.current = true; setActive(id); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: active === id ? 'linear-gradient(135deg, #f97316, #dc2626)' : 'rgba(255,255,255,0.04)',
                border: active === id ? '1px solid rgba(249,115,22,0.45)' : '1px solid rgba(255,255,255,0.10)',
                color: active === id ? '#fff' : 'rgba(255,255,255,0.65)',
                boxShadow: active === id ? '0 8px 24px rgba(249,115,22,0.35)' : 'none',
              }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-center">
          <div key={current.id} style={{ animation: 'lp-fade-up 0.5s ease-out both' }}>
            <h3 className="text-2xl font-bold tracking-tight">{current.label}</h3>
            <p className="text-base text-white/60 mt-3 leading-relaxed">{current.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-white/35">
              <Zap size={12} className="text-orange-400" />
              <span>Auto-rotating preview · click any tab to pin</span>
            </div>
          </div>
          <div className="relative" key={`shot-${current.id}`} style={{ animation: 'lp-fade-in 0.5s ease-out both' }}>
            <BrowserFrame title={`${current.label} — mostafa`} url={`fullrangelab.com/clients/...`}>
              <img src={current.img} alt={current.label} className="block w-full h-auto" draggable={false} />
            </BrowserFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── feature: exercise library ───────────────────── */

function ExerciseLibraryFeature() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Exercise library"
        title="Your exercises, your videos, your way"
        desc="A curated library of physiotherapy and strength movements with built-in video links. Add your own, tag them however you want, and reuse them across every program."
      />
      <div ref={ref} className="reveal grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-center mt-14">
        <div className="relative">
          <BrowserFrame title="Exercise Library" url="fullrangelab.com/exercises">
            <img src={SHOTS.exerciseLibrary} alt="Exercise library" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
          {/* Video preview floating card */}
          <div className="absolute -bottom-10 -right-4 sm:-right-10 w-[55%] hidden sm:block"
            style={{ animation: 'lp-float 6s ease-in-out infinite', animationDelay: '0.4s' }}>
            <div className="rounded-xl overflow-hidden border border-white/15 shadow-2xl"
              style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
              <img src={SHOTS.exerciseVideo} alt="Exercise video preview" className="block w-full h-auto" draggable={false} />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <FeatureBullet icon={PlayCircle} title="Video preview in place" desc="Tap any exercise to watch the form video without leaving the library." />
          <FeatureBullet icon={Layers} title="Browse by muscle group" desc="Chest, back, shoulders, biceps, triceps, legs, glutes, core, cardio, full body." />
          <FeatureBullet icon={Sparkles} title="Add your own moves" desc="Custom exercises with primary muscle, equipment, difficulty, tags, and your own video URL." />
        </div>
      </div>

      {/* Add Exercise screenshot below — full row */}
      <div className="mt-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="order-2 lg:order-1">
          <BrowserFrame title="Add Exercise" tone="modal" compact>
            <img src={SHOTS.addExercise} alt="Add exercise" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
        </div>
        <div className="order-1 lg:order-2">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Custom exercises in 20 seconds</h3>
          <p className="text-base text-white/60 mt-4 leading-relaxed">
            Name it, drop a YouTube link, pick a category, and tag it however you want. It's instantly searchable across every program builder.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── feature: program builder ───────────────────── */

function ProgramBuilderFeature() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Program builder"
        title="Drag-and-drop programs in minutes"
        desc="Group exercises into sessions, drag to reorder, set reps/sets/weight/rest, and save reusable templates so you never start from a blank page."
      />

      <div ref={ref} className="reveal relative mt-14">
        <BrowserFrame title="New Training Plan" url="fullrangelab.com/programs/new">
          <img src={SHOTS.programBuilder} alt="Program builder" className="block w-full h-auto" draggable={false} />
        </BrowserFrame>

        {/* Floating exercise picker */}
        <div className="absolute top-[8%] left-[6%] w-[60%] hidden sm:block"
          style={{ animation: 'lp-float 7s ease-in-out infinite' }}>
          <BrowserFrame compact title="Add Exercise" tone="modal">
            <img src={SHOTS.programPicker} alt="Exercise picker" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
        </div>

        {/* Floating annotations */}
        <Annotation pos={{ bottom: '14%', right: '-4%' }} hideOn="lg" extraStyle={{ animationDelay: '0.3s' }}>
          <AnnoIcon><Layers size={14} /></AnnoIcon>
          <span>Save as template — reuse forever</span>
        </Annotation>
      </div>

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Multi-day splits' },
          { icon: Target, label: 'Per-set targets' },
          { icon: ClipboardList, label: 'Coach notes' },
          { icon: Sparkles, label: 'Reusable templates' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="lp-card rounded-xl px-4 py-4 flex items-center gap-3">
            <Icon size={16} className="text-orange-400 shrink-0" />
            <span className="text-sm text-white/80 font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Programs list small */}
      <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">All your plans, ranked</h3>
          <p className="text-base text-white/60 mt-3 leading-relaxed">
            Each program shows the assigned client, focus area, and last edit. One click to preview as PDF or send to a client.
          </p>
        </div>
        <BrowserFrame title="Training Plans" url="fullrangelab.com/programs">
          <img src={SHOTS.programsList} alt="Programs list" className="block w-full h-auto" draggable={false} />
        </BrowserFrame>
      </div>
    </section>
  );
}

/* ───────────────────── feature: diet ───────────────────── */

function DietFeature() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Diet planning"
        title="Build diet plans alongside training"
        desc="A built-in food library and per-meal planner so the same client folder holds their training and their nutrition. No second tool, no spreadsheets."
      />

      <div ref={ref} className="reveal grid lg:grid-cols-2 gap-10 mt-14 items-center">
        <div>
          <BrowserFrame title="Food Library" url="fullrangelab.com/food-library">
            <img src={SHOTS.foodLibrary} alt="Food library" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Built-in foods" value={500} suffix="+" />
            <Stat label="Macro fields" value={8} />
          </div>
        </div>
        <div className="relative">
          <BrowserFrame title="Diet Plan — Saturday" url="fullrangelab.com/diet-plans/...">
            <img src={SHOTS.dietBuilder} alt="Diet builder" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
          <div className="absolute -top-8 -right-4 sm:-right-10 w-[58%] hidden md:block"
            style={{ animation: 'lp-float 7s ease-in-out infinite', animationDelay: '0.5s' }}>
            <BrowserFrame compact title="Add Food" tone="modal">
              <img src={SHOTS.addFood} alt="Add food" className="block w-full h-auto" draggable={false} />
            </BrowserFrame>
          </div>
        </div>
      </div>

      <div className="mt-12 grid sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
        <FeatureBullet icon={Salad} title="Per-meal macros" desc="Auto totals for kcal, protein, carbs, fat at meal and day level." />
        <FeatureBullet icon={Layers} title="Custom serving units" desc="Grams, ml, scoop, tbsp, cup — or roll your own." />
        <FeatureBullet icon={Sparkles} title="Add custom foods" desc="Anything missing? Add it and it's instantly searchable." />
      </div>
    </section>
  );
}

/* ───────────────────── feature: branding & export ───────────────────── */

function BrandingFeature() {
  const ref = useReveal<HTMLDivElement>();
  const palettes = [
    { id: 'orange', label: 'Orange', color: '#f97316' },
    { id: 'teal',   label: 'Teal',   color: '#14b8a6' },
    { id: 'indigo', label: 'Indigo', color: '#6366f1' },
    { id: 'rose',   label: 'Rose',   color: '#f43f5e' },
    { id: 'emerald',label: 'Emerald',color: '#10b981' },
    { id: 'amber',  label: 'Amber',  color: '#f59e0b' },
  ];
  const [active, setActive] = useState(palettes[0].id);
  const current = palettes.find((p) => p.id === active) ?? palettes[0];

  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Branding & export"
        title="PDFs and Excel sheets that look like yours"
        desc="Your clinic name, logo, contact details, and color palette ride along on every export. Send them, print them, share via WhatsApp — it stays on-brand."
      />

      <div ref={ref} className="reveal grid lg:grid-cols-2 gap-10 mt-14 items-center">
        <div className="relative">
          <BrowserFrame title="Configuration" url="fullrangelab.com/config">
            <img src={SHOTS.configTrainer} alt="Configuration" className="block w-full h-auto" draggable={false} />
          </BrowserFrame>
          <div className="absolute -bottom-8 -right-4 sm:-right-10 w-[55%] hidden md:block"
            style={{ animation: 'lp-float 7s ease-in-out infinite', animationDelay: '0.6s' }}>
            <BrowserFrame compact title="Templates & palette">
              <img src={SHOTS.configTemplates} alt="Configuration templates" className="block w-full h-auto" draggable={false} />
            </BrowserFrame>
          </div>
        </div>

        <div>
          <FeatureBullet icon={Palette} title="Pick your palette" desc="A dozen pre-built palettes that recolor every PDF and Excel template." />
          <div className="mt-3" />
          <FeatureBullet icon={FileText} title="Pre-built templates" desc="Professional, Patient-friendly, Checklist, Clinical, Modern, Minimal, Bold — and many more." />
          <div className="mt-3" />
          <FeatureBullet icon={Send} title="Send via WhatsApp or email" desc="Built-in templated messages with your name and contact details." />

          {/* Live palette preview */}
          <div className="mt-8 lp-card rounded-xl p-5">
            <div className="text-[11px] tracking-wider uppercase font-bold text-white/45 mb-3">Try a palette</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {palettes.map((p) => (
                <button key={p.id} onClick={() => setActive(p.id)}
                  aria-label={p.label}
                  className="w-8 h-8 rounded-full border-2 transition-transform"
                  style={{
                    background: p.color,
                    borderColor: active === p.id ? '#fff' : 'rgba(255,255,255,0.15)',
                    transform: active === p.id ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: active === p.id ? `0 6px 24px ${p.color}80` : 'none',
                  }}
                />
              ))}
            </div>
            <div className="rounded-lg p-4 transition-colors duration-500 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${current.color}1f 0%, transparent 100%)`,
                border: `1px solid ${current.color}55`,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: current.color, boxShadow: `0 8px 20px ${current.color}55` }}>MS</div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: current.color }}>Coach Mostafa</div>
                  <div className="text-[11px] text-white/55">Training plan · {current.label}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[0.95, 0.7, 0.45].map((opacity, i) => (
                  <div key={i} className="h-1.5 rounded-full" style={{ background: current.color, opacity }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export templates grid */}
      <div className="mt-16">
        <BrowserFrame title="Exported Sheet Templates" url="fullrangelab.com/config">
          <img src={SHOTS.exportTemplates} alt="Export templates" className="block w-full h-auto" draggable={false} />
        </BrowserFrame>
      </div>
    </section>
  );
}

/* ───────────────────── client portal ───────────────────── */

function ClientPortalCallout() {
  const tabs = [
    {
      id: 'today',
      label: 'Today',
      icon: Activity,
      img: SHOTS.portalToday,
      desc: 'Sessions logged, current streak, weight delta — and today\'s training expanded automatically. Clients land in the right place every time.',
      bullets: [
        'Today\'s session opens by default',
        'Live streak + weight progress',
        'Daily meals appear on the same screen',
      ],
    },
    {
      id: 'training',
      label: 'Training Plan',
      icon: Dumbbell,
      img: SHOTS.portalTraining,
      desc: 'The full program, session by session and exercise by exercise. Tap a set to log lifted weights — every rep flows back to you.',
      bullets: [
        'Per-set weight logging',
        'Sets · reps · tempo on every exercise',
        'Auto-rolls up to the trainer',
      ],
    },
    {
      id: 'diet',
      label: 'Diet Plan',
      icon: Salad,
      img: SHOTS.portalDiet,
      desc: 'Daily macro targets and every meal with serving sizes — clients always know what to eat, no spreadsheet required.',
      bullets: [
        'Daily kcal + macro targets',
        'Meal-by-meal breakdown',
        'Edit-free for the client; you stay in control',
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      img: SHOTS.portalProfile,
      desc: 'Clients keep their own goals, preferences, and dislikes up to date — in English or Arabic. You see updates on their trainer profile.',
      bullets: [
        'Self-edit goals · preferences · dislikes',
        'Bilingual (English / Arabic) UI',
        'Changes sync to the trainer view',
      ],
    },
    {
      id: 'measurements',
      label: 'Measurements',
      icon: Camera,
      img: SHOTS.portalMeasurements,
      desc: 'Self-logged check-ins and progress photos — front, side, back. They submit, you review, both sides stay aligned.',
      bullets: [
        'Front / side / back progress photos',
        'Compare any two check-ins side-by-side',
        'Body metrics chart over time',
      ],
    },
  ];

  const [active, setActive] = useState(tabs[0].id);
  const ref = useReveal<HTMLDivElement>();
  const userTouched = useRef(false);

  useEffect(() => {
    if (userTouched.current) return;
    const id = setInterval(() => {
      if (userTouched.current) return;
      setActive((cur) => {
        const i = tabs.findIndex((t) => t.id === cur);
        return tabs[(i + 1) % tabs.length].id;
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <section id="client-portal" className="px-5 sm:px-8 py-20 sm:py-28 max-w-7xl mx-auto">
      <div ref={ref} className="reveal rounded-3xl overflow-hidden relative" style={{
        background: 'linear-gradient(135deg, rgba(249,115,22,0.10) 0%, rgba(220,38,38,0.06) 100%)',
        border: '1px solid rgba(249,115,22,0.20)',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 55% 60% at 80% 30%, rgba(249,115,22,0.18) 0%, transparent 70%)',
          animation: 'lp-glow-breath 8s ease-in-out infinite',
        }} />

        <div className="relative p-8 sm:p-14">
          <div className="max-w-3xl">
            <div className="lp-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5">
              <Smartphone size={13} className="text-orange-300" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-orange-200">Client portal</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Your clients get their own private portal
            </h2>
            <p className="text-base sm:text-lg text-white/65 mt-5 leading-relaxed">
              Mobile-first, branded with your logo, available in English and Arabic. Clients see their plans, log check-ins, upload photos — and never leave your brand.
            </p>
          </div>

          {/* Tab bar */}
          <div className="mt-10 flex flex-wrap gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id}
                onClick={() => { userTouched.current = true; setActive(id); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: active === id ? 'linear-gradient(135deg, #f97316, #dc2626)' : 'rgba(255,255,255,0.04)',
                  border: active === id ? '1px solid rgba(249,115,22,0.45)' : '1px solid rgba(255,255,255,0.10)',
                  color: active === id ? '#fff' : 'rgba(255,255,255,0.65)',
                  boxShadow: active === id ? '0 8px 24px rgba(249,115,22,0.35)' : 'none',
                }}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-center">
            <div className="relative" key={`shot-${current.id}`} style={{ animation: 'lp-fade-in 0.5s ease-out both' }}>
              <BrowserFrame title={`Client Portal — ${current.label}`} url="fullrangelab.com/client">
                <img src={current.img} alt={current.label} className="block w-full h-auto" draggable={false} />
              </BrowserFrame>
              {/* Floating meals preview only on the Today tab */}
              {current.id === 'today' && (
                <div className="absolute -right-4 -bottom-10 hidden md:block w-48 lg:w-56 rounded-xl overflow-hidden border border-white/15"
                  style={{
                    animation: 'lp-float 6s ease-in-out infinite',
                    boxShadow: '0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(249,115,22,0.18)',
                    background: 'rgba(8,4,1,0.7)',
                  }}>
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-orange-200 uppercase tracking-wider"
                    style={{ background: 'rgba(249,115,22,0.12)', borderBottom: '1px solid rgba(249,115,22,0.22)' }}>
                    Today's meals
                  </div>
                  <img src={SHOTS.portalMeals} alt="Today's meals card" className="block w-full h-auto" draggable={false} />
                </div>
              )}
            </div>

            <div key={current.id} style={{ animation: 'lp-fade-up 0.5s ease-out both' }}>
              <h3 className="text-xl font-bold tracking-tight">{current.label}</h3>
              <p className="text-base text-white/65 mt-3 leading-relaxed">{current.desc}</p>
              <ul className="mt-6 space-y-3">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/85">
                    <span className="w-5 h-5 rounded-full bg-orange-500/15 border border-orange-400/40 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-2 text-xs text-white/35">
                <Zap size={12} className="text-orange-400" />
                <span>Auto-rotating · click any tab to pin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── pricing teaser ───────────────────── */

function PricingTeaser() {
  const ref = useReveal<HTMLDivElement>();
  const perks = [
    { icon: Camera,        label: 'Progress photos & check-ins' },
    { icon: Send,          label: 'WhatsApp & email export' },
    { icon: ClipboardList, label: 'Reusable program templates' },
    { icon: Salad,         label: 'Built-in diet planner' },
    { icon: Smartphone,    label: 'Mobile client portal' },
    { icon: Palette,       label: 'Branded PDFs & Excel' },
  ];
  return (
    <section ref={ref} className="reveal px-5 sm:px-8 py-20 sm:py-24 max-w-5xl mx-auto text-center">
      <SectionHeader
        eyebrow="Pricing"
        title="Try it free for 14 days"
        desc="Full access during your trial — no credit card. Upgrade only when you're sure it fits the way you work."
      />

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {perks.map(({ icon: Icon, label }) => (
          <div key={label} className="lp-card rounded-xl px-4 py-3 text-left flex items-center gap-3">
            <Icon size={16} className="text-orange-400 shrink-0" />
            <span className="text-sm text-white/85 font-medium">{label}</span>
          </div>
        ))}
      </div>

      <Link to="/pricing"
        className="lp-outline inline-flex items-center justify-center gap-2 mt-10 px-6 py-3 rounded-xl text-sm font-semibold text-orange-200 border border-orange-400/30">
        See full pricing <ArrowRight size={14} />
      </Link>
    </section>
  );
}

/* ───────────────────── final CTA ───────────────────── */

function FinalCta() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="px-5 sm:px-8 py-20 sm:py-28 max-w-5xl mx-auto">
      <div ref={ref} className="reveal rounded-3xl text-center px-6 sm:px-12 py-14 sm:py-20 relative overflow-hidden border border-white/10"
        style={{ background: 'linear-gradient(135deg, rgba(20,10,4,0.95), rgba(8,4,1,0.95))' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(249,115,22,0.22) 0%, transparent 65%)',
          animation: 'lp-glow-breath 7s ease-in-out infinite',
        }} />
        <div className="relative">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Ready to run a smarter studio?</h2>
          <p className="text-base text-white/55 mt-4 max-w-xl mx-auto">
            Set up your first client and program in under 10 minutes. No credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/signup"
              className="lp-cta inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white">
              Get started free <ArrowRight size={16} />
            </Link>
            <Link to="/login"
              className="lp-outline inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-semibold text-white/85 border border-white/15">
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── footer ───────────────────── */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/8 mt-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandTile className="w-7 h-7 rounded-lg" />
          <span className="text-sm text-white/50">© {new Date().getFullYear()} Full Range Lab</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link to="/signup" className="hover:text-white transition-colors">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────── shared building blocks ───────────────────── */

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal text-center max-w-3xl mx-auto">
      <p className="text-xs font-bold tracking-[0.18em] uppercase text-orange-300 mb-3">{eyebrow}</p>
      <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">{title}</h2>
      <p className="text-base text-white/55 mt-4 leading-relaxed">{desc}</p>
    </div>
  );
}

function FeatureBullet({ icon: Icon, title, desc }: { icon: typeof Users; title: string; desc: string }) {
  return (
    <div className="lp-card rounded-xl p-5 flex gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)' }}>
        <Icon size={18} className="text-orange-300" />
      </div>
      <div>
        <h4 className="text-base font-bold tracking-tight">{title}</h4>
        <p className="text-sm text-white/55 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function BrowserFrame({
  children, title, url, compact, tone, glow = true, edgeFade = true,
}: {
  children: ReactNode;
  title?: string;
  url?: string;
  compact?: boolean;
  tone?: 'default' | 'modal';
  glow?: boolean;
  edgeFade?: boolean;
}) {
  const isModal = tone === 'modal';
  return (
    <div className="lp-shot-wrap">
      {glow && <div className="lp-shot-halo" aria-hidden />}
      <div className="lp-shot-frame lp-tilt rounded-xl overflow-hidden border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(20,10,4,0.6), rgba(8,4,1,0.6))',
          boxShadow: compact
            ? '0 16px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
        <div className={`flex items-center gap-2 ${compact ? 'px-3 py-2' : 'px-4 py-2.5'}`}
          style={{ background: 'rgba(8,4,1,0.65)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }} />
          </div>
          {url && !isModal && (
            <div className="ml-3 flex-1 max-w-md text-[11px] text-white/40 font-mono truncate px-3 py-1 rounded-md"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              {url}
            </div>
          )}
          {title && (
            <div className="ml-auto text-[11px] text-white/45 font-medium truncate">
              {title}
            </div>
          )}
        </div>
        <div className="relative">
          {children}
          {edgeFade && <div className="lp-shot-edge" aria-hidden />}
        </div>
      </div>
    </div>
  );
}

function Annotation({
  pos, hideOn, children, extraStyle,
}: {
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  hideOn?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  extraStyle?: CSSProperties;
}) {
  const hideClass = hideOn === 'lg' ? 'hidden lg:flex' : hideOn === 'md' ? 'hidden md:flex' : hideOn === 'sm' ? 'hidden sm:flex' : 'flex';
  return (
    <div
      className={`lp-anno rounded-xl absolute ${hideClass} items-center gap-2 px-3 py-2 text-xs font-medium whitespace-nowrap`}
      style={{ ...pos, ...extraStyle, color: 'rgba(255,255,255,0.92)' }}
    >
      {children}
    </div>
  );
}

function AnnoIcon({ children }: { children: ReactNode }) {
  return (
    <span className="w-6 h-6 rounded-md flex items-center justify-center"
      style={{ background: 'rgba(249,115,22,0.18)', border: '1px solid rgba(249,115,22,0.35)', color: '#fdba74' }}>
      {children}
    </span>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1100;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            setN(Math.round(value * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    io.observe(node);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="lp-card rounded-xl px-4 py-3">
      <div className="text-2xl font-black tracking-tight" style={{
        background: 'linear-gradient(135deg, #fb923c, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>{n}{suffix ?? ''}</div>
      <div className="text-[11px] uppercase tracking-wider font-bold text-white/45 mt-0.5">{label}</div>
    </div>
  );
}
