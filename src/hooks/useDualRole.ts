import { useCallback, useSyncExternalStore } from 'react';
import { useUserStore } from '../store/userStore';
import { useSettingsStore } from '../store/settingsStore';
import { useClientPortalStore } from '../store/clientPortalStore';

// Same auth user can be both a trainer (own account) and a portal client
// (invited into another trainer's roster). The picker UI lets them choose
// which side to render; the choice is per-browser-session and cleared on
// sign-out. RLS already grants access to whichever rows match auth.uid(),
// so this is purely a UI gate.

const ACTIVE_ROLE_KEY = 'frl_active_role';

export type ActiveRole = 'trainer' | 'client';

function readStored(): ActiveRole | null {
  try {
    const v = localStorage.getItem(ACTIVE_ROLE_KEY);
    return v === 'trainer' || v === 'client' ? v : null;
  } catch { return null; }
}

// Tiny pub-sub so React components re-render when localStorage changes.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}
function notify() { listeners.forEach((cb) => cb()); }

export function setActiveRole(role: ActiveRole) {
  try { localStorage.setItem(ACTIVE_ROLE_KEY, role); } catch { /* ignore */ }
  notify();
}

export function clearActiveRole() {
  try { localStorage.removeItem(ACTIVE_ROLE_KEY); } catch { /* ignore */ }
  notify();
}

export function useDualRole() {
  const profileType  = useSettingsStore((s) => s.profileType);
  const role         = useUserStore((s) => s.role);
  const linkedClient = useClientPortalStore((s) => s.linkedClient);

  const activeRole = useSyncExternalStore(subscribe, readStored, readStored);

  // Trainer signal: completed onboarding (profileType set) OR privileged role.
  // Pure portal clients never go through onboarding, so profileType stays
  // undefined for them — that's our discriminator.
  const isTrainer = !!profileType || role === 'super_admin' || role === 'staff';
  const isLinkedClient = linkedClient !== null;
  const isDualRole = isTrainer && isLinkedClient;

  // The linked client row id — picker uses it to look up the inviting
  // trainer's display name via a join through clients.user_id.
  const linkedClientId = linkedClient?.id ?? null;

  const set = useCallback((r: ActiveRole) => setActiveRole(r), []);
  const clear = useCallback(() => clearActiveRole(), []);

  return {
    isTrainer,
    isLinkedClient,
    isDualRole,
    activeRole,
    linkedClientId,
    setActiveRole: set,
    clearActiveRole: clear,
  };
}
