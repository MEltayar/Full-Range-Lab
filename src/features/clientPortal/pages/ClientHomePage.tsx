import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Utensils, Scale, Plus, Check, MessageSquare, Menu, X, Flame, TrendingDown, TrendingUp, Target, CalendarDays, AlertTriangle } from 'lucide-react';
import { useClientPortalStore } from '../../../store/clientPortalStore';
import { useClientSessionLogStore } from '../../../store/clientSessionLogStore';
import { useClientCheckInStore } from '../../../store/clientCheckInStore';
import { useClientProgressPhotoStore } from '../../../store/clientProgressPhotoStore';
import { useDietLogStore } from '../../../store/dietLogStore';
import { useExerciseStore } from '../../../store/exerciseStore';
import { useToastStore } from '../../../store/toastStore';
import { supabase } from '../../../lib/supabase';
import { dbRowToProgram, dbRowToDietPlan, dbRowToFoodItem } from '../../../lib/mappers';
import type { Program, DietPlan, FoodItem, LoggedExercise, LoggedSet } from '../../../types';
import CheckInForm from '../../clients/components/CheckInForm';
import ProgressPhotosPanel from '../../clients/components/ProgressPhotosPanel';
import SelfProfileEditor from '../components/SelfProfileEditor';
import { BrandTile } from '../../../components/Brand';
import ClientSidebar, { CLIENT_NAV_ITEMS, type TabId } from '../components/ClientSidebar';
import ToastContainer from '../../../components/ui/ToastContainer';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  catch { return iso; }
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatSessionLabel(session: { label: string; dayOfWeek?: number }): string {
  const dayName  = session.dayOfWeek != null ? WEEKDAY_NAMES[session.dayOfWeek] : null;
  const subtitle = session.label.trim();
  if (dayName && subtitle) return `${dayName} — ${subtitle}`;
  if (dayName)             return dayName;
  if (subtitle)            return subtitle;
  return 'Session';
}

function todayIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isoFromDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtFullDate(d = new Date()): string {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

function initials(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const FITNESS_GOAL_LABEL: Record<string, string> = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  rehab:       'Rehabilitation',
  endurance:   'Endurance',
  flexibility: 'Flexibility',
  general:     'General Fitness',
};

export default function ClientHomePage() {
  const linkedClient = useClientPortalStore((s) => s.linkedClient);
  const showToast    = useToastStore((s) => s.showToast);

  const exercises       = useExerciseStore((s) => s.exercises);
  const initExercises   = useExerciseStore((s) => s.initializeFromDB);
  const exercisesLoaded = useExerciseStore((s) => s.isLoaded);

  const sessionLogs       = useClientSessionLogStore((s) => s.logs);
  const loadLogs          = useClientSessionLogStore((s) => s.loadForClient);
  const addSessionLog     = useClientSessionLogStore((s) => s.addLog);
  const updateSessionLog  = useClientSessionLogStore((s) => s.updateLog);
  const deleteSessionLog  = useClientSessionLogStore((s) => s.deleteLog);

  const checkIns       = useClientCheckInStore((s) => s.checkIns);
  const loadCheckIns   = useClientCheckInStore((s) => s.loadForClient);
  const addCheckIn     = useClientCheckInStore((s) => s.addCheckIn);

  const dietLogs       = useDietLogStore((s) => s.logs);
  const loadDietLogs   = useDietLogStore((s) => s.loadForClient);
  const upsertDietLog  = useDietLogStore((s) => s.upsert);

  const loadPhotos    = useClientProgressPhotoStore((s) => s.loadForClient);

  const [programs,  setPrograms]  = useState<Program[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [foodItems, setFoodItems] = useState<Record<string, FoodItem>>({});
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [todaySessionIdx, setTodaySessionIdx] = useState(0);
  const [plansDayIdx, setPlansDayIdx] = useState(0);
  const [plansSessionIdx, setPlansSessionIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('clientPortalActiveTab') : null;
    return saved === 'today' || saved === 'plans' || saved === 'me' ? saved : 'today';
  });
  useEffect(() => {
    try { localStorage.setItem('clientPortalActiveTab', activeTab); } catch { /* storage unavailable */ }
  }, [activeTab]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!linkedClient) return;
    supabase.from('programs').select('*').eq('client_id', linkedClient.id)
      .then(({ data }) => setPrograms((data ?? []).map(dbRowToProgram)));
    supabase.from('diet_plans').select('*').eq('client_id', linkedClient.id)
      .then(({ data }) => setDietPlans((data ?? []).map(dbRowToDietPlan)));
    loadLogs(linkedClient.id);
    loadCheckIns(linkedClient.id);
    loadDietLogs(linkedClient.id);
    loadPhotos(linkedClient.id);
  }, [linkedClient, loadLogs, loadCheckIns, loadDietLogs, loadPhotos]);

  useEffect(() => {
    const ids = new Set<string>();
    dietPlans.forEach((plan) =>
      plan.days.forEach((day) =>
        day.meals.forEach((meal) =>
          meal.items.forEach((it) => { if (it.foodItemId) ids.add(it.foodItemId); })
        )
      )
    );
    if (ids.size === 0) { setFoodItems({}); return; }
    supabase.from('food_items').select('*').in('id', Array.from(ids))
      .then(({ data }) => {
        const map: Record<string, FoodItem> = {};
        (data ?? []).forEach((row) => {
          const food = dbRowToFoodItem(row);
          map[food.id] = food;
        });
        setFoodItems(map);
      });
  }, [dietPlans]);

  useEffect(() => { if (!exercisesLoaded) initExercises(); }, [exercisesLoaded, initExercises]);

  const exerciseById = useMemo(() => {
    const m: Record<string, string> = {};
    exercises.forEach((e) => { m[e.id] = e.name; });
    return m;
  }, [exercises]);

  const activeProgram   = useMemo(() => programs.find((p) => p.status === 'active') ?? programs[0], [programs]);
  const activeDietPlan  = useMemo(() => dietPlans.find((d) => d.status === 'active') ?? dietPlans[0], [dietPlans]);
  const latestCheckIn   = checkIns[0];

  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const sessionDays = new Set<string>();
    sessionLogs.forEach((l) => {
      const d = new Date(l.loggedAt);
      d.setHours(0, 0, 0, 0);
      if (d >= sevenDaysAgo && d <= today) sessionDays.add(l.loggedAt);
    });

    const activeDays = new Set<string>();
    sessionLogs.forEach((l) => activeDays.add(l.loggedAt));
    dietLogs.forEach((l) => { if (l.eaten) activeDays.add(l.date); });

    let streak = 0;
    const cursor = new Date(today);
    // If nothing today yet, start counting from yesterday so an unstarted day doesn't break a streak built up earlier.
    if (!activeDays.has(isoFromDate(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (activeDays.has(isoFromDate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    let weightDelta: number | null = null;
    if (checkIns.length >= 2) {
      const w1 = checkIns[0].weightKg;
      const w2 = checkIns[1].weightKg;
      if (w1 !== undefined && w2 !== undefined) weightDelta = +(w1 - w2).toFixed(1);
    }

    return {
      sessionsThisWeek: sessionDays.size,
      sessionsTarget: activeProgram?.sessions.length ?? 0,
      streak,
      latestWeight: latestCheckIn?.weightKg,
      weightDelta,
    };
  }, [sessionLogs, dietLogs, checkIns, activeProgram, latestCheckIn]);

  // Engagement window read-out for the portal. Null end date = open-ended (no chip/banner shown).
  const subscriptionInfo = useMemo(() => {
    const end = linkedClient?.subscriptionEndDate;
    if (!end) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const endDate = new Date(`${end}T00:00:00`);
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000);
    const endLabel = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return { daysLeft, endLabel };
  }, [linkedClient?.subscriptionEndDate]);

  // When the active program first loads (or changes), point Today's training at today's session if one matches.
  useEffect(() => {
    if (!activeProgram || activeProgram.sessions.length === 0) return;
    const dow = new Date().getDay();
    const idx = activeProgram.sessions.findIndex((s) => s.dayOfWeek === dow);
    setTodaySessionIdx(idx === -1 ? 0 : idx);
  }, [activeProgram?.id]);

  // Same for the active diet plan and Today's meals.
  useEffect(() => {
    if (!activeDietPlan || activeDietPlan.days.length === 0) return;
    const dow = new Date().getDay();
    const idx = activeDietPlan.days.findIndex((d) => d.dayOfWeek === dow);
    setActiveDayIdx(idx === -1 ? 0 : idx);
  }, [activeDietPlan?.id]);

  const currentTabLabel = CLIENT_NAV_ITEMS.find((t) => t.id === activeTab)?.label ?? '';

  if (!linkedClient) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <BrandTile className="w-6 h-6 rounded-md" />
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{currentTabLabel}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-3">

            {/* Welcome strip — non-Today tabs only */}
            {activeTab !== 'today' && (
              <div className="hidden md:block">
                <p className="text-xs uppercase tracking-wide text-gray-400">Welcome</p>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{linkedClient.name}</h1>
              </div>
            )}

            {/* ───────────────────────── TODAY ───────────────────────── */}
            {activeTab === 'today' && (
              <>
                {/* Hero strip */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-rose-600 text-white px-5 py-6 md:px-7 md:py-8 shadow-sm">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
                  <div className="absolute -right-6 -bottom-12 w-48 h-48 rounded-full bg-rose-300/20 blur-3xl" aria-hidden />
                  <div className="relative flex flex-col gap-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 font-semibold">{fmtFullDate()}</p>
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                      {greeting()}, {firstName(linkedClient.name)}.
                    </h1>
                    <p className="text-sm text-white/85 mt-1">
                      {todayStats.streak >= 2
                        ? `You're on a ${todayStats.streak}-day streak — keep it rolling.`
                        : todayStats.sessionsThisWeek > 0
                          ? `${todayStats.sessionsThisWeek} session${todayStats.sessionsThisWeek === 1 ? '' : 's'} logged this week. Let's add one more.`
                          : "Today is a fresh start — let's get one in."}
                    </p>
                  </div>
                </section>

                {/* Subscription nudge — only when 14 days or less remain */}
                {subscriptionInfo && subscriptionInfo.daysLeft <= 14 && subscriptionInfo.daysLeft >= 0 && (
                  <section className="rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-tight">
                        {subscriptionInfo.daysLeft === 0
                          ? 'Your subscription ends today.'
                          : subscriptionInfo.daysLeft === 1
                            ? 'Your subscription ends tomorrow.'
                            : `Your subscription ends in ${subscriptionInfo.daysLeft} days.`}
                      </p>
                      <p className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-0.5">
                        Reach out to your trainer to renew before {subscriptionInfo.endLabel}.
                      </p>
                    </div>
                  </section>
                )}

                {/* Stat tiles */}
                <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Sessions this week with progress ring */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                    <ProgressRing
                      done={todayStats.sessionsThisWeek}
                      total={todayStats.sessionsTarget}
                      color="#f97316"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">This week</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight tabular-nums">
                        {todayStats.sessionsThisWeek}
                        {todayStats.sessionsTarget > 0 && (
                          <span className="text-gray-400 font-medium">/{todayStats.sessionsTarget}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">sessions</p>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Flame size={22} className="text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Streak</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight tabular-nums">
                        {todayStats.streak}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{todayStats.streak === 1 ? 'day' : 'days'}</p>
                    </div>
                  </div>

                  {/* Latest weight + delta */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Scale size={22} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Weight</p>
                      {todayStats.latestWeight != null ? (
                        <>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight tabular-nums">
                            {todayStats.latestWeight}
                            <span className="text-xs text-gray-400 font-medium ml-0.5">kg</span>
                          </p>
                          {todayStats.weightDelta !== null ? (
                            <p className={`text-[11px] tabular-nums flex items-center gap-0.5 ${
                              todayStats.weightDelta < 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : todayStats.weightDelta > 0
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {todayStats.weightDelta < 0 ? <TrendingDown size={11} /> : todayStats.weightDelta > 0 ? <TrendingUp size={11} /> : null}
                              {todayStats.weightDelta > 0 ? '+' : ''}{todayStats.weightDelta} kg
                            </p>
                          ) : (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">latest</p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-gray-400 leading-tight">—</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">no check-in</p>
                        </>
                      )}
                    </div>
                  </div>
                </section>

                {linkedClient.trainerMessage && (
                  <section className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-emerald-900/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex gap-3">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-500/15 dark:bg-emerald-500/25 flex items-center justify-center">
                      <MessageSquare size={16} className="text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Message from your trainer</p>
                      <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{linkedClient.trainerMessage}</p>
                    </div>
                  </section>
                )}

                {/* Today's training */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent border-b border-orange-100 dark:border-orange-900/30">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm shrink-0">
                      <Dumbbell size={18} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Today's training</h2>
                      <p className="text-xs text-orange-600 dark:text-orange-400 truncate">
                        {activeProgram?.name ?? 'Rest day'}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">

                  {!activeProgram ? (
                    <div className="flex flex-col items-center text-center gap-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                        <Target size={20} className="text-orange-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rest day — no active program right now.</p>
                    </div>
                  ) : (() => {
                    const sessions = activeProgram.sessions;
                    const safeIdx = Math.min(todaySessionIdx, Math.max(0, sessions.length - 1));
                    const currentSession = sessions[safeIdx];
                    const today = todayIso();
                    return (
                      <div className="flex flex-col gap-3">
                        {sessions.length === 0 ? (
                          <p className="text-sm text-gray-400">No sessions in this program.</p>
                        ) : (
                          <>
                            {sessions.length > 1 && (
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Today I'm doing</label>
                                <select
                                  value={safeIdx}
                                  onChange={(e) => setTodaySessionIdx(Number(e.target.value))}
                                  className="flex-1 px-2 py-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                  {sessions.map((s, i) => (
                                    <option key={s.id} value={i}>{formatSessionLabel(s)}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {currentSession && (() => {
                              const log = sessionLogs.find(
                                (l) =>
                                  l.programId === activeProgram.id &&
                                  l.programSessionId === currentSession.id &&
                                  l.loggedAt === today
                              );
                              const loggedByExerciseId = new Map(
                                (log?.exercises ?? []).map((e) => [e.exerciseId, e]),
                              );

                              const persistExercise = async (
                                exerciseId: string,
                                next: LoggedExercise | null,
                              ) => {
                                const current = log?.exercises ?? [];
                                const idx = current.findIndex((e) => e.exerciseId === exerciseId);
                                let nextExercises: LoggedExercise[];
                                if (next === null) {
                                  if (idx === -1) return;
                                  nextExercises = [...current.slice(0, idx), ...current.slice(idx + 1)];
                                } else if (idx === -1) {
                                  nextExercises = [...current, next];
                                } else {
                                  nextExercises = [...current.slice(0, idx), next, ...current.slice(idx + 1)];
                                }
                                try {
                                  if (!log) {
                                    if (nextExercises.length === 0) return;
                                    await addSessionLog({
                                      clientId: linkedClient.id,
                                      programId: activeProgram.id,
                                      programSessionId: currentSession.id,
                                      loggedAt: today,
                                      exercises: nextExercises,
                                    });
                                  } else if (nextExercises.length === 0 && !log.notes) {
                                    await deleteSessionLog(log.id);
                                  } else {
                                    await updateSessionLog(log.id, { exercises: nextExercises });
                                  }
                                } catch {
                                  showToast('Failed to save.', 'error');
                                }
                              };

                              return (
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2.5">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatSessionLabel(currentSession)}</p>
                                    {currentSession.exercises.length > 0 && (
                                      <p className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
                                        {currentSession.exercises.length} exercise{currentSession.exercises.length === 1 ? '' : 's'}
                                      </p>
                                    )}
                                  </div>

                                  {currentSession.exercises.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No exercises.</p>
                                  ) : (
                                    <ul className="flex flex-col">
                                      {currentSession.exercises.map((ex) => {
                                        const parts: string[] = [];
                                        if (ex.sets && ex.reps)        parts.push(`${ex.sets} × ${ex.reps}`);
                                        else if (ex.sets)              parts.push(`${ex.sets} sets`);
                                        else if (ex.reps)              parts.push(`${ex.reps} reps`);
                                        if (ex.holdTime)               parts.push(`hold ${ex.holdTime}s`);
                                        if (ex.weightKg != null)       parts.push(`${ex.weightKg}kg`);
                                        if (ex.restSeconds)            parts.push(`${ex.restSeconds}s rest`);
                                        const line = parts.join(' · ');
                                        const logged = loggedByExerciseId.get(ex.exerciseId);
                                        return (
                                          <li
                                            key={ex.id}
                                            className="border-t border-gray-200 dark:border-gray-700 first:border-t-0 py-2 first:pt-0 last:pb-0"
                                          >
                                            <div className="flex items-baseline justify-between gap-2 mb-1">
                                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                                {exerciseById[ex.exerciseId] ?? '(unknown exercise)'}
                                              </p>
                                              {line && (
                                                <p className="text-[11px] text-gray-400 tabular-nums shrink-0">{line}</p>
                                              )}
                                            </div>
                                            {ex.notes && (
                                              <p className="text-[11px] text-gray-400 italic mb-1.5">{ex.notes}</p>
                                            )}
                                            <LogSetsEditor
                                              exerciseId={ex.exerciseId}
                                              prescribedSets={ex.sets}
                                              logged={logged}
                                              onChange={(next) => persistExercise(ex.exerciseId, next)}
                                            />
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}

                                  {log && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                      <NoteEditor
                                        initialValue={log.notes ?? ''}
                                        placeholder="Overall thoughts on this session — for your trainer."
                                        accent="orange"
                                        onSave={async (value) => {
                                          try {
                                            await updateSessionLog(log.id, { notes: value || undefined });
                                            showToast('Note saved.', 'success');
                                          } catch (err) {
                                            console.error('[session-log] save note failed', err);
                                            showToast('Failed to save note.', 'error');
                                          }
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                </section>

                {/* Today's meals */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30 dark:to-transparent border-b border-emerald-100 dark:border-emerald-900/30">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
                      <Utensils size={18} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Today's meals</h2>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                        {activeDietPlan?.name ?? 'No active diet plan'}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">

                  {!activeDietPlan ? (
                    <div className="flex flex-col items-center text-center gap-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Utensils size={20} className="text-emerald-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active diet plan yet.</p>
                    </div>
                  ) : (() => {
                    const days = activeDietPlan.days;
                    const safeIdx = Math.min(activeDayIdx, Math.max(0, days.length - 1));
                    const currentDay = days[safeIdx];
                    const today = todayIso();
                    return (
                      <div className="flex flex-col gap-3">
                        {days.length > 0 && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Today I'm following</label>
                            <select
                              value={safeIdx}
                              onChange={(e) => setActiveDayIdx(Number(e.target.value))}
                              className="flex-1 px-2 py-1 rounded-md text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                              {days.map((d, i) => (
                                <option key={d.id} value={i}>{d.label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {!currentDay || currentDay.meals.length === 0 ? (
                          <p className="text-sm text-gray-400">No meals set up.</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {currentDay.meals.map((meal) => {
                              let mealKcal = 0;
                              let mealProtein = 0;
                              meal.items.forEach((it) => {
                                const f = foodItems[it.foodItemId];
                                if (!f) return;
                                const mult = (it.servingMultiplier ?? 1) * it.quantity;
                                mealKcal    += f.calories * mult;
                                mealProtein += f.protein  * mult;
                              });
                              const log = dietLogs.find(
                                (l) =>
                                  l.planId  === activeDietPlan.id &&
                                  l.dayId   === currentDay.id     &&
                                  l.mealId  === meal.id           &&
                                  l.date    === today
                              );
                              const eaten = log?.eaten ?? false;
                              return (
                                <div
                                  key={meal.id}
                                  className={`rounded-lg border px-3 py-2.5 transition-colors ${
                                    eaten
                                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <button
                                      type="button"
                                      onClick={() => upsertDietLog({
                                        clientId: linkedClient.id,
                                        planId: activeDietPlan.id,
                                        dayId: currentDay.id,
                                        mealId: meal.id,
                                        date: today,
                                        eaten: !eaten,
                                      }).catch(() => showToast('Failed to save.', 'error'))}
                                      className="flex items-center gap-2 min-w-0"
                                    >
                                      <span
                                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md border ${
                                          eaten
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                        }`}
                                      >
                                        {eaten && <Check size={13} strokeWidth={3} />}
                                      </span>
                                      <span className={`text-sm font-semibold ${eaten ? 'text-emerald-700 dark:text-emerald-300 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {meal.label}
                                      </span>
                                    </button>
                                    {meal.items.length > 0 && (
                                      <p className="text-[11px] text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
                                        {Math.round(mealKcal)} kcal · {Math.round(mealProtein)}g P
                                      </p>
                                    )}
                                  </div>
                                  {meal.items.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No items.</p>
                                  ) : (
                                    <ul className="flex flex-col gap-1">
                                      {meal.items.map((it) => {
                                        const f = foodItems[it.foodItemId];
                                        const mult = (it.servingMultiplier ?? 1) * it.quantity;
                                        const kcal = f ? Math.round(f.calories * mult) : null;
                                        const serving = it.servingLabel
                                          ?? (f ? `${it.quantity} × ${f.servingSize}${f.servingUnit}` : `${it.quantity}×`);
                                        return (
                                          <li key={it.id} className="flex items-baseline justify-between gap-2 text-sm">
                                            <div className="min-w-0">
                                              <span className="text-gray-900 dark:text-gray-100">{f?.name ?? '(unknown food)'}</span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400"> · {serving}</span>
                                              {it.notes && <span className="text-[11px] text-gray-400 italic"> — {it.notes}</span>}
                                            </div>
                                            {kcal !== null && (
                                              <span className="text-[11px] text-gray-400 tabular-nums shrink-0">{kcal} kcal</span>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                  <NoteEditor
                                    initialValue={log?.notes ?? ''}
                                    placeholder="Ate something different? Add a note for your trainer."
                                    accent="emerald"
                                    onSave={async (value) => {
                                      try {
                                        await upsertDietLog({
                                          clientId: linkedClient.id,
                                          planId: activeDietPlan.id,
                                          dayId: currentDay.id,
                                          mealId: meal.id,
                                          date: today,
                                          notes: value || undefined,
                                        });
                                        showToast('Note saved.', 'success');
                                      } catch (err) {
                                        console.error('[diet-log] save note failed', err);
                                        showToast('Failed to save note.', 'error');
                                      }
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                </section>
              </>
            )}

            {/* ───────────────────────── PLANS ───────────────────────── */}
            {activeTab === 'plans' && (
              <>
                {/* Training plan (full, dropdown by session) */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent border-b border-orange-100 dark:border-orange-900/30">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm shrink-0">
                      <Dumbbell size={18} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Training plan</h2>
                      <p className="text-xs text-orange-600 dark:text-orange-400 truncate">
                        {activeProgram
                          ? `${activeProgram.durationWeeks} ${activeProgram.durationWeeks === 1 ? 'week' : 'weeks'}${activeProgram.goal ? ` · ${activeProgram.goal}` : ''}${activeProgram.condition ? ` · ${activeProgram.condition}` : ''}`
                          : 'No active program yet'}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                  {!activeProgram ? (
                    <div className="flex flex-col items-center text-center gap-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                        <Target size={20} className="text-orange-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active program yet.</p>
                    </div>
                  ) : (() => {
                    const sessions = activeProgram.sessions;
                    const safeIdx = Math.min(plansSessionIdx, Math.max(0, sessions.length - 1));
                    const currentSession = sessions[safeIdx];
                    return (
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeProgram.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {sessions.length} session{sessions.length === 1 ? '' : 's'} per week
                          </p>
                        </div>

                        {sessions.length === 0 ? (
                          <p className="text-sm text-gray-400">No sessions in this program.</p>
                        ) : (
                          <>
                            {sessions.length > 1 && (
                              <div className="flex items-center gap-2 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 px-3 py-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300 shrink-0">Session</label>
                                <select
                                  value={safeIdx}
                                  onChange={(e) => setPlansSessionIdx(Number(e.target.value))}
                                  className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
                                >
                                  {sessions.map((s, i) => (
                                    <option key={s.id} value={i}>{formatSessionLabel(s)}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {currentSession && (
                              <div className="rounded-2xl bg-gradient-to-br from-orange-50/60 to-transparent dark:from-orange-950/20 dark:to-transparent border border-orange-100 dark:border-orange-900/40 p-4">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                  <p className="text-base font-bold text-gray-900 dark:text-gray-100">{formatSessionLabel(currentSession)}</p>
                                  {currentSession.exercises.length > 0 && (
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-900/40 px-2 py-0.5 rounded-full">
                                      {currentSession.exercises.length} {currentSession.exercises.length === 1 ? 'exercise' : 'exercises'}
                                    </span>
                                  )}
                                </div>
                                {currentSession.exercises.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">No exercises.</p>
                                ) : (
                                  <ul className="flex flex-col gap-1.5">
                                    {currentSession.exercises.map((ex, i) => {
                                      const chips: { label: string; tone: 'primary' | 'muted' }[] = [];
                                      if (ex.sets && ex.reps)        chips.push({ label: `${ex.sets} × ${ex.reps}`,    tone: 'primary' });
                                      else if (ex.sets)              chips.push({ label: `${ex.sets} sets`,            tone: 'primary' });
                                      else if (ex.reps)              chips.push({ label: `${ex.reps} reps`,            tone: 'primary' });
                                      if (ex.holdTime)               chips.push({ label: `hold ${ex.holdTime}s`,        tone: 'primary' });
                                      if (ex.weightKg != null)       chips.push({ label: `${ex.weightKg} kg`,           tone: 'primary' });
                                      if (ex.restSeconds)            chips.push({ label: `${ex.restSeconds}s rest`,     tone: 'muted' });
                                      return (
                                        <li
                                          key={ex.id}
                                          className="flex gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2.5"
                                        >
                                          <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                                            {i + 1}
                                          </div>
                                          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                                              {exerciseById[ex.exerciseId] ?? '(unknown exercise)'}
                                            </p>
                                            {chips.length > 0 && (
                                              <div className="flex flex-wrap gap-1">
                                                {chips.map((c) => (
                                                  <span
                                                    key={c.label}
                                                    className={`text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md ${
                                                      c.tone === 'primary'
                                                        ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-900/50'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                                    }`}
                                                  >
                                                    {c.label}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            {ex.notes && (
                                              <p className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-snug">{ex.notes}</p>
                                            )}
                                          </div>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                </section>

                {/* Diet plan (full, dropdown by day) */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-950/30 dark:to-transparent border-b border-emerald-100 dark:border-emerald-900/30">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shrink-0">
                      <Utensils size={18} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Diet plan</h2>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                        {activeDietPlan?.name ?? 'No active diet plan yet'}
                      </p>
                    </div>
                  </div>
                  <div className="p-5">
                  {!activeDietPlan ? (
                    <div className="flex flex-col items-center text-center gap-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Utensils size={20} className="text-emerald-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">No active diet plan yet.</p>
                    </div>
                  ) : (() => {
                    const days = activeDietPlan.days;
                    const safeIdx = Math.min(plansDayIdx, Math.max(0, days.length - 1));
                    const currentDay = days[safeIdx];
                    return (
                      <div className="flex flex-col gap-3">
                        {activeDietPlan.targetCalories && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400 font-semibold">Calories</p>
                              <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">{activeDietPlan.targetCalories}</p>
                            </div>
                            {activeDietPlan.targetProtein && (
                              <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-rose-700 dark:text-rose-400 font-semibold">Protein</p>
                                <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">{activeDietPlan.targetProtein}<span className="text-xs text-gray-400 font-medium">g</span></p>
                              </div>
                            )}
                            {activeDietPlan.targetCarbs && (
                              <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-amber-700 dark:text-amber-400 font-semibold">Carbs</p>
                                <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">{activeDietPlan.targetCarbs}<span className="text-xs text-gray-400 font-medium">g</span></p>
                              </div>
                            )}
                            {activeDietPlan.targetFat && (
                              <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-blue-700 dark:text-blue-400 font-semibold">Fat</p>
                                <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">{activeDietPlan.targetFat}<span className="text-xs text-gray-400 font-medium">g</span></p>
                              </div>
                            )}
                          </div>
                        )}

                        {days.length > 1 && (
                          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3 py-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 shrink-0">Day</label>
                            <select
                              value={safeIdx}
                              onChange={(e) => setPlansDayIdx(Number(e.target.value))}
                              className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none cursor-pointer"
                            >
                              {days.map((d, i) => (
                                <option key={d.id} value={i}>{d.label}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {!currentDay || currentDay.meals.length === 0 ? (
                          <p className="text-sm text-gray-400">No meals set up.</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {currentDay.meals.map((meal, mi) => {
                              let mealKcal = 0;
                              let mealProtein = 0;
                              meal.items.forEach((it) => {
                                const f = foodItems[it.foodItemId];
                                if (!f) return;
                                const mult = (it.servingMultiplier ?? 1) * it.quantity;
                                mealKcal    += f.calories * mult;
                                mealProtein += f.protein  * mult;
                              });
                              return (
                                <div
                                  key={meal.id}
                                  className="rounded-2xl bg-gradient-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/20 dark:to-transparent border border-emerald-100 dark:border-emerald-900/40 p-4"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                                      {mi + 1}
                                    </div>
                                    <p className="flex-1 text-base font-bold text-gray-900 dark:text-gray-100 truncate">{meal.label}</p>
                                    {meal.items.length > 0 && (
                                      <div className="flex gap-1 shrink-0">
                                        <span className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                                          {Math.round(mealKcal)} kcal
                                        </span>
                                        <span className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50">
                                          {Math.round(mealProtein)}g P
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {meal.items.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No items.</p>
                                  ) : (
                                    <ul className="flex flex-col gap-1">
                                      {meal.items.map((it) => {
                                        const f = foodItems[it.foodItemId];
                                        const mult = (it.servingMultiplier ?? 1) * it.quantity;
                                        const kcal = f ? Math.round(f.calories * mult) : null;
                                        const serving = it.servingLabel
                                          ?? (f ? `${it.quantity} × ${f.servingSize}${f.servingUnit}` : `${it.quantity}×`);
                                        return (
                                          <li
                                            key={it.id}
                                            className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2"
                                          >
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{f?.name ?? '(unknown food)'}</p>
                                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                {serving}
                                                {it.notes && <span className="italic text-gray-400"> — {it.notes}</span>}
                                              </p>
                                            </div>
                                            {kcal !== null && (
                                              <span className="text-[11px] font-semibold tabular-nums text-gray-500 dark:text-gray-400 shrink-0">
                                                {kcal} kcal
                                              </span>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {activeDietPlan.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-2">
                            {activeDietPlan.notes}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                </section>
              </>
            )}

            {/* ───────────────────────── ME ───────────────────────── */}
            {activeTab === 'me' && (
              <>
                {/* Identity hero — warm sunset, on-brand and distinct from Today's orange-dominant hero */}
                <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 text-white px-5 py-6 md:px-7 md:py-8 shadow-sm">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15 blur-2xl" aria-hidden />
                  <div className="absolute -left-12 -bottom-16 w-56 h-56 rounded-full bg-rose-300/25 blur-3xl" aria-hidden />
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/30">
                      <span className="text-xl md:text-2xl font-bold tracking-tight">{initials(linkedClient.name)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 font-semibold">Profile</p>
                      <h1 className="text-2xl md:text-3xl font-bold leading-tight truncate">{linkedClient.name}</h1>
                      <p className="text-sm text-white/85 mt-0.5">
                        {[
                          linkedClient.fitnessGoal && FITNESS_GOAL_LABEL[linkedClient.fitnessGoal],
                          linkedClient.age != null ? `${linkedClient.age} yrs` : null,
                          linkedClient.heightCm != null ? `${linkedClient.heightCm} cm` : null,
                        ].filter(Boolean).join(' · ') || 'Tap any field below to fill in your profile.'}
                      </p>
                      {subscriptionInfo && subscriptionInfo.daysLeft >= 0 && (
                        <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20 text-white">
                          <CalendarDays size={11} />
                          Access until {subscriptionInfo.endLabel} · {subscriptionInfo.daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <SelfProfileEditor client={linkedClient} />

                {/* Measurements */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30 dark:to-transparent border-b border-orange-100 dark:border-orange-900/30">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-sm shrink-0">
                      <Scale size={18} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">Measurements</h2>
                      <p className="text-xs text-orange-600 dark:text-orange-400 truncate">
                        {latestCheckIn ? `Last check-in ${fmtDate(latestCheckIn.date)}` : 'No check-ins yet'}
                      </p>
                    </div>
                    {!showCheckInForm && (
                      <button
                        onClick={() => setShowCheckInForm(true)}
                        className="flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm shrink-0"
                      >
                        <Plus size={13} /> Add
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    {showCheckInForm ? (
                      <CheckInForm
                        clientId={linkedClient.id}
                        onSave={async (data) => {
                          try {
                            await addCheckIn(data);
                            showToast('Check-in saved.', 'success');
                          } catch {
                            showToast('Failed to save check-in.', 'error');
                            throw new Error('save failed');
                          }
                        }}
                        onCancel={() => setShowCheckInForm(false)}
                      />
                    ) : !latestCheckIn ? (
                      <div className="flex flex-col items-center text-center gap-2 py-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                          <Scale size={20} className="text-orange-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No measurements logged yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { label: 'Weight',    value: latestCheckIn.weightKg,   unit: 'kg' },
                          { label: 'Body fat',  value: latestCheckIn.bodyFatPct, unit: '%'  },
                          { label: 'Waist',     value: latestCheckIn.waistCm,    unit: 'cm' },
                          { label: 'Chest',     value: latestCheckIn.chestCm,    unit: 'cm' },
                          { label: 'Arm',       value: latestCheckIn.armCm,      unit: 'cm' },
                          { label: 'Thigh',     value: latestCheckIn.thighCm,    unit: 'cm' },
                        ]
                          .filter((m) => m.value !== undefined)
                          .map((m) => (
                            <div key={m.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{m.label}</p>
                              <p className="text-base font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                                {m.value}<span className="text-xs text-gray-400 font-medium ml-0.5">{m.unit}</span>
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Progress photos */}
                <ProgressPhotosPanel clientId={linkedClient.id} surface="client" />
              </>
            )}
          </div>
        </main>
      </div>

      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}

function ProgressRing({ done, total, color, size = 48 }: { done: number; total: number; color: string; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(1, done / total) : 0;
  const offset = circumference * (1 - pct);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 350ms ease-out' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-gray-700 dark:text-gray-200">
        {total > 0 ? `${Math.round(pct * 100)}%` : '—'}
      </span>
    </div>
  );
}

type NoteAccent = 'emerald' | 'orange';

const NOTE_ACCENT: Record<NoteAccent, { hover: string; ring: string; button: string }> = {
  emerald: {
    hover: 'hover:text-emerald-600 dark:hover:text-emerald-400',
    ring: 'focus:ring-emerald-500',
    button: 'bg-emerald-500 hover:bg-emerald-600',
  },
  orange: {
    hover: 'hover:text-orange-600 dark:hover:text-orange-400',
    ring: 'focus:ring-orange-500',
    button: 'bg-orange-500 hover:bg-orange-600',
  },
};

function NoteEditor({
  initialValue,
  placeholder,
  accent,
  onSave,
}: {
  initialValue: string;
  placeholder: string;
  accent: NoteAccent;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(initialValue.length > 0);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
    if (initialValue.length > 0) setOpen(true);
  }, [initialValue]);

  const dirty = value.trim() !== initialValue.trim();
  const styles = NOTE_ACCENT[accent];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-2 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 ${styles.hover}`}
      >
        <MessageSquare size={11} /> Add note
      </button>
    );
  }
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`w-full px-2 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-1 ${styles.ring}`}
      />
      <div className="flex items-center gap-2 self-end">
        {!dirty && initialValue.length === 0 && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!dirty}
          onClick={() => {
            onSave(value.trim());
            if (value.trim().length === 0) setOpen(false);
          }}
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md text-white disabled:opacity-40 disabled:cursor-not-allowed ${styles.button}`}
        >
          Save note
        </button>
      </div>
    </div>
  );
}

function LogSetsEditor({
  exerciseId,
  prescribedSets,
  logged,
  onChange,
}: {
  exerciseId: string;
  prescribedSets?: number;
  logged?: LoggedExercise;
  onChange: (next: LoggedExercise | null) => void | Promise<void>;
}) {
  const sets = logged?.sets ?? [];

  if (sets.length === 0) {
    return (
      <button
        type="button"
        onClick={() => {
          const initial: LoggedSet[] = Array.from(
            { length: Math.max(1, prescribedSets ?? 1) },
            () => ({}),
          );
          onChange({ exerciseId, sets: initial, notes: logged?.notes });
        }}
        className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-semibold rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
      >
        <Plus size={13} /> Log sets
      </button>
    );
  }

  const updateSet = (idx: number, patch: Partial<LoggedSet>) => {
    const next = sets.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange({ exerciseId, sets: next, notes: logged?.notes });
  };
  const addSet = () => {
    onChange({ exerciseId, sets: [...sets, {}], notes: logged?.notes });
  };
  const removeSet = (idx: number) => {
    const next = sets.filter((_, i) => i !== idx);
    if (next.length === 0 && !logged?.notes) {
      onChange(null);
    } else {
      onChange({ exerciseId, sets: next, notes: logged?.notes });
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {sets.map((set, i) => (
        <SetRow
          key={i}
          index={i}
          set={set}
          onChange={(patch) => updateSet(i, patch)}
          onRemove={() => removeSet(i)}
        />
      ))}
      <button
        type="button"
        onClick={addSet}
        className="self-start inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
      >
        <Plus size={11} /> Add set
      </button>
    </div>
  );
}

function SetRow({
  index,
  set,
  onChange,
  onRemove,
}: {
  index: number;
  set: LoggedSet;
  onChange: (patch: Partial<LoggedSet>) => void;
  onRemove: () => void;
}) {
  const [reps, setReps] = useState(set.reps != null ? String(set.reps) : '');
  const [weight, setWeight] = useState(set.weightKg != null ? String(set.weightKg) : '');

  useEffect(() => {
    setReps(set.reps != null ? String(set.reps) : '');
  }, [set.reps]);
  useEffect(() => {
    setWeight(set.weightKg != null ? String(set.weightKg) : '');
  }, [set.weightKg]);

  const commitReps = () => {
    const trimmed = reps.trim();
    const next = trimmed === '' ? undefined : Number(trimmed);
    if (next === set.reps) return;
    if (next !== undefined && !Number.isFinite(next)) return;
    onChange({ reps: next });
  };
  const commitWeight = () => {
    const trimmed = weight.trim();
    const next = trimmed === '' ? undefined : Number(trimmed);
    if (next === set.weightKg) return;
    if (next !== undefined && !Number.isFinite(next)) return;
    onChange({ weightKg: next });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-12 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 tabular-nums shrink-0">Set {index + 1}</span>
      <input
        type="number"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={commitReps}
        placeholder="reps"
        className="w-16 h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center font-semibold text-gray-900 dark:text-gray-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <span className="text-gray-400 text-xs">×</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.5"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={commitWeight}
        placeholder="kg"
        className="w-20 h-9 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center font-semibold text-gray-900 dark:text-gray-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <span className="text-[11px] text-gray-400">kg</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Remove set"
      >
        <X size={14} />
      </button>
    </div>
  );
}
