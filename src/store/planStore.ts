import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToSubscription } from '../lib/mappers';
import { useUserStore } from './userStore';
import type { Subscription, PlanLimits } from '../types';

const TRIAL_LIMITS: PlanLimits = {
  maxClients: 2,
  maxProgramsPerClient: 1,
  maxClientsInvited: 0,
  canPreview: false,
  canExportPDF: false,
  canExportExcel: false,
  canAddCustomExercise: false,
  canSaveTemplate: false,
  canAccessConfig: false,
  canShare: false,
  canAccessDietPlans: false,
  canManageFood: false,
  canAccessClientAnalytics: false,
  canUseExportTemplates: false,
};

const PRO_MONTHLY_LIMITS: PlanLimits = {
  maxClients: Infinity,
  maxProgramsPerClient: Infinity,
  maxClientsInvited: 30,
  canPreview: true,
  canExportPDF: true,
  canExportExcel: false,
  canAddCustomExercise: true,
  canSaveTemplate: true,
  canAccessConfig: true,
  canShare: false,
  canAccessDietPlans: true,
  canManageFood: true,
  canAccessClientAnalytics: false,
  canUseExportTemplates: false,
};

const PRO_YEARLY_LIMITS: PlanLimits = {
  maxClients: Infinity,
  maxProgramsPerClient: Infinity,
  maxClientsInvited: Infinity,
  canPreview: true,
  canExportPDF: true,
  canExportExcel: true,
  canAddCustomExercise: true,
  canSaveTemplate: true,
  canAccessConfig: true,
  canShare: true,
  canAccessDietPlans: true,
  canManageFood: true,
  canAccessClientAnalytics: true,
  canUseExportTemplates: true,
};

const TRIAL_DURATION_DAYS = 14;

function calcTrialDaysLeft(trialStartedAt: string): number {
  const start = new Date(trialStartedAt).getTime();
  const now = Date.now();
  const diffDays = (now - start) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DURATION_DAYS - diffDays));
}

// Manual-payment workflow: a Pro plan is only honoured while
// `currentPeriodEnd` is in the future. NULL = nothing booked yet → treat
// as expired, so admin must always set a date when flipping someone to Pro.
function isPeriodValid(end: string | null | undefined): boolean {
  if (!end) return false;
  const today = new Date().toISOString().slice(0, 10);
  return end.slice(0, 10) >= today;
}

interface PlanStore {
  subscription: Subscription | null;
  isLoaded: boolean;

  fetchSubscription: () => Promise<void>;
  reset: () => void;
  incrementClientsCreated: () => Promise<void>;

  // Computed
  isPro: () => boolean;
  isTrialExpired: () => boolean;
  isSubscriptionExpired: () => boolean;
  trialDaysLeft: () => number;
  /** Days until `currentPeriodEnd`, or null when not on a Pro plan / no end set. */
  subscriptionDaysLeft: () => number | null;
  limits: () => PlanLimits;
  clientLimitReached: () => boolean;
}

const SUB_CACHE_PREFIX = 'frl_sub_';
const SUB_LEGACY_KEY   = 'frl_sub'; // pre-user-scoped key — wipe on read

function subCacheKey(userId: string): string {
  return `${SUB_CACHE_PREFIX}${userId}`;
}

function readSubCache(userId: string): Subscription | null {
  // Wipe legacy global key the first time we see it (no user-id leak going forward).
  try { localStorage.removeItem(SUB_LEGACY_KEY); } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(subCacheKey(userId));
    return raw ? JSON.parse(raw) as Subscription : null;
  } catch { return null; }
}
function writeSubCache(userId: string, sub: Subscription | null) {
  try {
    if (sub) localStorage.setItem(subCacheKey(userId), JSON.stringify(sub));
    else localStorage.removeItem(subCacheKey(userId));
  } catch { /* ignore */ }
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  subscription: null,
  isLoaded: false,

  reset: () => {
    set({ subscription: null, isLoaded: false });
  },

  fetchSubscription: async () => {
    if (get().isLoaded) return;

    // Validate session before any DB call — expired tokens cause 406 spam
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      // No valid session; authStore's TOKEN_REFRESH_FAILED handler will sign out
      set({ isLoaded: true });
      return;
    }

    const userId = session.user.id;

    // Serve from cache immediately so ProtectedRoute resolves without a network round-trip
    const cached = readSubCache(userId);
    if (cached) {
      set({ subscription: cached, isLoaded: true });
      // Verify in the background and update if the plan changed.
      // Order + limit tolerate any number of rows (handles historical duplicates).
      supabase.from('subscriptions').select('*')
        .order('trial_started_at', { ascending: false }).limit(1).maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            const fresh = dbRowToSubscription(data);
            writeSubCache(userId, fresh);
            set({ subscription: fresh });
          }
        });
      return;
    }

    // No cache — full fetch. Pick the newest row to tolerate historical duplicates
    // from the old ignoreDuplicates bug.
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('trial_started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch subscription:', error);
      set({ isLoaded: true });
      return;
    }

    // No subscription row yet — auto-create a trial (fallback for users who slipped through).
    // Dropping ignoreDuplicates so the upsert always returns the row (existing or new).
    if (!data) {
      const now = new Date().toISOString();
      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .upsert(
          { user_id: userId, plan: 'trial', status: 'active', trial_started_at: now, clients_created: 0 },
          { onConflict: 'user_id' },
        )
        .select('*')
        .maybeSingle();
      if (!insertError && newSub) {
        const sub = dbRowToSubscription(newSub);
        writeSubCache(userId, sub);
        set({ subscription: sub, isLoaded: true });
        return;
      }
      if (insertError) console.error('Failed to create trial subscription:', insertError);
      set({ isLoaded: true });
      return;
    }

    const sub = dbRowToSubscription(data);
    writeSubCache(userId, sub);
    set({ subscription: sub, isLoaded: true });
  },

  incrementClientsCreated: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const next = (get().subscription?.clientsCreated ?? 0) + 1;
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ clients_created: next })
      .eq('user_id', user.id)
      .select('clients_created')
      .maybeSingle();
    if (error) { console.error('[planStore] incrementClientsCreated failed:', error); return; }
    if (data) {
      set((state) => ({
        subscription: state.subscription
          ? { ...state.subscription, clientsCreated: data.clients_created }
          : null,
      }));
    }
  },

  isPro: () => {
    if (useUserStore.getState().role === 'super_admin') return true;
    const { subscription } = get();
    if (!subscription) return false;
    const isProPlan = subscription.plan === 'pro_monthly' || subscription.plan === 'pro_yearly';
    return isProPlan && isPeriodValid(subscription.currentPeriodEnd);
  },

  isTrialExpired: () => {
    if (useUserStore.getState().role === 'super_admin') return false;
    const { subscription } = get();
    if (!subscription) return false;
    if (subscription.plan !== 'trial') return false;
    return calcTrialDaysLeft(subscription.trialStartedAt) === 0;
  },

  isSubscriptionExpired: () => {
    if (useUserStore.getState().role === 'super_admin') return false;
    const { subscription } = get();
    if (!subscription) return false;
    const isProPlan = subscription.plan === 'pro_monthly' || subscription.plan === 'pro_yearly';
    return isProPlan && !isPeriodValid(subscription.currentPeriodEnd);
  },

  trialDaysLeft: () => {
    if (useUserStore.getState().role === 'super_admin') return 0;
    const { subscription } = get();
    if (!subscription || subscription.plan !== 'trial') return 0;
    return calcTrialDaysLeft(subscription.trialStartedAt);
  },

  subscriptionDaysLeft: () => {
    const { subscription } = get();
    if (!subscription) return null;
    const isProPlan = subscription.plan === 'pro_monthly' || subscription.plan === 'pro_yearly';
    if (!isProPlan) return null;
    const end = subscription.currentPeriodEnd;
    if (!end) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  limits: () => {
    if (useUserStore.getState().role === 'super_admin') return PRO_YEARLY_LIMITS;
    const plan = get().subscription?.plan;
    if (plan === 'pro_yearly') return PRO_YEARLY_LIMITS;
    if (plan === 'pro_monthly') return PRO_MONTHLY_LIMITS;
    return TRIAL_LIMITS;
  },

  clientLimitReached: () => {
    const store = get();
    if (store.isPro()) return false;
    const created = store.subscription?.clientsCreated ?? 0;
    return created >= TRIAL_LIMITS.maxClients;
  },
}));
