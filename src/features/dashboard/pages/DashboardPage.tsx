import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Dumbbell,
  Library,
  ChevronRight,
  AlertCircle,
  UserPlus,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useClientStore } from '../../../store/clientStore';
import { useProgramStore } from '../../../store/programStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTemplateStore } from '../../../store/templateStore';
import { usePlanStore } from '../../../store/planStore';
import { useUserStore } from '../../../store/userStore';
import GymFloatAnimation from '../../../components/GymFloatAnimation';

// ── Helpers ───────────────────────────────────────────────

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return fmtDate(iso);
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Stat card ────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
  to: string;
}

function StatCard({ label, value, sub, icon: Icon, gradient, to }: StatCardProps) {
  return (
    <Link
      to={to}
      className={`relative flex flex-col justify-between rounded-2xl p-5 overflow-hidden hover:scale-[1.02] active:scale-[0.99] transition-transform shadow-md min-h-[110px] ${gradient}`}
    >
      <div className="absolute -right-5 -bottom-5 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-white/20 shadow-sm">
          <Icon size={18} className="text-white" />
        </div>
        <ChevronRight size={14} className="text-white/50 mt-1" />
      </div>
      <div className="mt-3">
        <p className="text-3xl font-extrabold text-white leading-none">{value}</p>
        <p className="text-xs text-white/75 font-medium mt-1">{label}</p>
        {sub && <p className="text-xs text-white/50 mt-0.5">{sub}</p>}
      </div>
    </Link>
  );
}

// ── Status badge ─────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (status === 'active')    return <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Active</span>;
  if (status === 'paused')    return <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700  dark:text-amber-400  bg-amber-100  dark:bg-amber-900/40  px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-500  inline-block" />Paused</span>;
  if (status === 'completed') return <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500  dark:text-gray-400  bg-gray-100   dark:bg-gray-700       px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-gray-400   inline-block" />Done</span>;
  return null;
}

// ── Main page ─────────────────────────────────────────────

export default function DashboardPage() {
  const { clients, isLoaded: clientsLoaded, initializeFromDB: initClients } = useClientStore();
  const { programs, isLoaded: programsLoaded, initializeFromDB: initPrograms } = useProgramStore();
  const { exercises, isLoaded: exercisesLoaded, initializeFromDB: initExercises } = useExerciseStore();
  const { templates, isLoaded: templatesLoaded, initializeFromDB: initTemplates } = useTemplateStore();
  const { clinicName, clinicLogo, therapistName, profileType, isLoaded: settingsLoaded } = useSettingsStore();

  const subscription   = usePlanStore((s) => s.subscription);
  const planLoaded     = usePlanStore((s) => s.isLoaded);
  const trialDaysLeft  = usePlanStore((s) => s.trialDaysLeft());
  const subDaysLeft    = usePlanStore((s) => s.subscriptionDaysLeft());
  const userRole       = useUserStore((s) => s.role);

  useEffect(() => {
    if (!clientsLoaded)   initClients();
    if (!programsLoaded)  initPrograms();
    if (!exercisesLoaded) initExercises();
    if (!templatesLoaded) initTemplates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived ──────────────────────────────────────────────
  const isGym = profileType === 'gym';
  const isLoading = !clientsLoaded || !programsLoaded || !exercisesLoaded || !templatesLoaded;
  const isSetupIncomplete = settingsLoaded && !clinicName;

  const activePrograms  = useMemo(() => programs.filter((p) => p.status === 'active'),    [programs]);
  const pausedPrograms  = useMemo(() => programs.filter((p) => p.status === 'paused'),    [programs]);

  const clientsThisMonth = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(1); cutoff.setHours(0, 0, 0, 0);
    return clients.filter((c) => new Date(c.createdAt) >= cutoff).length;
  }, [clients]);

  const recentPrograms = useMemo(
    () => [...programs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),
    [programs],
  );

  const recentClients = useMemo(
    () => [...clients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [clients],
  );

  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);

  const clientsWithNoProgram = useMemo(() => {
    const assigned = new Set(programs.map((p) => p.clientId));
    return clients.filter((c) => !assigned.has(c.id));
  }, [clients, programs]);

  const hasNoData = clientsLoaded && programsLoaded && clients.length === 0 && programs.length === 0;

  const greetingText = therapistName
    ? isGym
      ? `${greeting()}, ${therapistName.split(' ')[0]}`
      : `${greeting()}, Dr. ${therapistName.split(' ')[0]}`
    : `${greeting()}`;

  // ── Plan pill (top-right) ──
  const planPill = (() => {
    if (!planLoaded || !subscription || userRole === 'super_admin') return null;
    const plan = subscription.plan;
    if (plan === 'trial') {
      const urgent = trialDaysLeft <= 3;
      return {
        label: 'Free Trial',
        detail: trialDaysLeft <= 0
          ? 'Trial ended'
          : `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left`,
        tone: urgent ? 'urgent' : 'trial' as const,
      };
    }
    if (plan === 'pro_monthly' || plan === 'pro_yearly') {
      const planLabel = plan === 'pro_monthly' ? 'Pro Monthly' : 'Pro Yearly';
      const end = subscription.currentPeriodEnd;
      const detail = end
        ? `Renews ${new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'Active';
      const urgent = subDaysLeft !== null && subDaysLeft <= 7;
      return { label: planLabel, detail, tone: urgent ? 'urgent' : 'pro' as const };
    }
    return null;
  })();

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="relative space-y-5 min-h-screen">
      <GymFloatAnimation count={18} />

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt={clinicName || 'Clinic logo'}
                className="w-10 h-10 rounded-xl object-contain bg-gray-100 dark:bg-gray-700 p-1 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <LayoutDashboard size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{greetingText}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {clinicName ? ` · ${clinicName}` : ''}
              </p>
              {planPill && (
                <Link
                  to="/pricing"
                  title="View pricing & manage your plan"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs hover:underline"
                >
                  <span className={[
                    'w-1.5 h-1.5 rounded-full',
                    planPill.tone === 'urgent' ? 'bg-red-500' : planPill.tone === 'pro' ? 'bg-emerald-500' : 'bg-orange-500',
                  ].join(' ')} />
                  <span className={[
                    'font-semibold',
                    planPill.tone === 'urgent'
                      ? 'text-red-600 dark:text-red-400'
                      : planPill.tone === 'pro'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-orange-600 dark:text-orange-400',
                  ].join(' ')}>{planPill.label}</span>
                  <span className="text-gray-400 dark:text-gray-500">·</span>
                  <span className="text-gray-500 dark:text-gray-400">{planPill.detail}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Setup banner ── */}
        {isSetupIncomplete && (
          <Link
            to="/config"
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-5 py-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {isGym ? 'Your profile is incomplete' : 'Clinic profile is incomplete'}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {isGym
                  ? 'Add your name and logo so training plan exports look professional.'
                  : 'Add your clinic name and logo so exports look professional.'}
              </p>
            </div>
            <ChevronRight size={16} className="text-amber-500 shrink-0" />
          </Link>
        )}

        {/* ── Stat cards ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[110px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Clients"
              value={clients.length}
              sub={clientsThisMonth > 0 ? `+${clientsThisMonth} this month` : undefined}
              icon={Users}
              gradient="bg-gradient-to-br from-orange-500 to-red-600"
              to="/clients"
            />
            <StatCard
              label="Active Programs"
              value={activePrograms.length}
              sub={programs.length > 0 ? `${programs.length} total` : undefined}
              icon={ClipboardList}
              gradient="bg-gradient-to-br from-teal-500 to-teal-700"
              to="/programs"
            />
            <StatCard
              label="Exercise Library"
              value={exercises.length}
              icon={Dumbbell}
              gradient="bg-gradient-to-br from-violet-500 to-violet-700"
              to="/exercises"
            />
            <StatCard
              label="Saved Templates"
              value={templates.filter((t) => !t.isBuiltIn).length}
              icon={Library}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              to="/templates"
            />
          </div>
        )}

        {/* ── Get started (no data) ── */}
        {hasNoData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Get started</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Add your first client, then build them a {isGym ? 'training plan' : 'rehabilitation program'}.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                to="/clients"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <UserPlus size={15} />
                Add Client
              </Link>
              <Link
                to="/exercises"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Dumbbell size={15} />
                Browse Exercises
              </Link>
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        {!hasNoData && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Recent Programs */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-teal-600 dark:text-teal-400" />
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Programs</h2>
                </div>
                <Link to="/programs" className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>

              {recentPrograms.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No programs yet.</p>
                  <Link to="/clients" className="mt-2 inline-block text-sm text-teal-600 dark:text-teal-400 hover:underline">
                    Start by adding a client →
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50 dark:divide-gray-700/60">
                  {recentPrograms.map((program) => {
                    const clientName = clientMap.get(program.clientId) ?? 'Unknown client';
                    const totalExercises = program.sessions.reduce((sum, s) => sum + s.exercises.length, 0);
                    return (
                      <li key={program.id}>
                        <Link
                          to={`/programs/${program.id}/preview`}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {program.name || 'Untitled program'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {clientName}{program.condition ? ` · ${program.condition}` : ''}
                            </p>
                          </div>

                          <div className="hidden sm:flex items-center gap-2 shrink-0">
                            <StatusBadge status={program.status} />
                            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {program.sessions.length}s · {totalExercises}ex
                            </span>
                          </div>

                          <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{timeAgo(program.createdAt)}</p>
                          <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Recent Clients */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-orange-500 dark:text-orange-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Clients</h2>
                  </div>
                  <Link to="/clients" className="text-xs text-orange-500 dark:text-orange-400 hover:underline font-medium flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </Link>
                </div>

                {recentClients.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No clients yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50 dark:divide-gray-700/60">
                    {recentClients.map((client) => {
                      const initials = client.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                      const progCount = programs.filter((p) => p.clientId === client.id).length;
                      return (
                        <li key={client.id}>
                          <Link
                            to={`/clients/${client.id}`}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0 shadow-sm">
                              <span className="text-xs font-bold text-white">{initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{client.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {progCount} program{progCount !== 1 ? 's' : ''}
                                {client.age ? ` · Age ${client.age}` : ''}
                              </p>
                            </div>
                            <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Paused programs alert */}
              {pausedPrograms.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-100 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
                    <PauseCircle size={15} className="text-amber-600 dark:text-amber-400" />
                    <h2 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Paused Programs</h2>
                  </div>
                  <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {pausedPrograms.slice(0, 3).map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/programs/${p.id}/preview`}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name || 'Untitled'}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{clientMap.get(p.clientId) ?? '—'}</p>
                          </div>
                          <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clients with no program */}
              {clientsWithNoProgram.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-violet-200 dark:border-violet-800/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-violet-100 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-900/10">
                    <AlertTriangle size={15} className="text-violet-600 dark:text-violet-400" />
                    <h2 className="font-semibold text-violet-800 dark:text-violet-300 text-sm">No Program Assigned</h2>
                    <span className="ml-auto text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                      {clientsWithNoProgram.length}
                    </span>
                  </div>
                  <ul className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {clientsWithNoProgram.slice(0, 3).map((c) => {
                      const initials = c.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                      return (
                        <li key={c.id}>
                          <Link
                            to={`/clients/${c.id}`}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                          >
                            <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{initials}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1 truncate">{c.name}</p>
                            <Link
                              to={`/programs/new?clientId=${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium shrink-0"
                            >
                              + Assign
                            </Link>
                          </Link>
                        </li>
                      );
                    })}
                    {clientsWithNoProgram.length > 3 && (
                      <li className="px-5 py-2 text-xs text-gray-400 dark:text-gray-500">
                        +{clientsWithNoProgram.length - 3} more without a program
                      </li>
                    )}
                  </ul>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── Progress summary (shows when there are completed programs) ── */}
        {!isLoading && programs.filter((p) => p.status === 'completed').length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-5">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={18} />
                <span className="text-2xl font-extrabold">{programs.filter((p) => p.status === 'completed').length}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completed</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-5">
              <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                <Activity size={18} />
                <span className="text-2xl font-extrabold">{activePrograms.length}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-5">
              <div className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                <TrendingUp size={18} />
                <span className="text-2xl font-extrabold">
                  {programs.length > 0
                    ? Math.round((programs.filter((p) => p.status === 'completed').length / programs.length) * 100)
                    : 0}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Completion rate</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
