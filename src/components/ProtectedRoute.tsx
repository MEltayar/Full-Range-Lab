import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import { usePlanStore } from '../store/planStore';
import { useClientPortalStore } from '../store/clientPortalStore';
import { useDualRole } from '../hooks/useDualRole';

const LandingPage = lazy(() => import('../pages/LandingPage'));

const LOAD_TIMEOUT_MS = 10_000;

interface Props {
  children: React.ReactNode;
  // When true, this route IS the picker — skip the auto-redirect logic
  // (the picker handles its own "not dual-role" bounce).
  requireDualRole?: boolean;
}

export default function ProtectedRoute({ children, requireDualRole = false }: Props) {
  const user            = useAuthStore((s) => s.user);
  const isLoaded        = useAuthStore((s) => s.isLoaded);
  const profileType     = useSettingsStore((s) => s.profileType);
  const settingsLoaded  = useSettingsStore((s) => s.isLoaded);
  const userStoreLoaded = useUserStore((s) => s.isLoaded);
  const planStoreLoaded = usePlanStore((s) => s.isLoaded);
  const linkedClient     = useClientPortalStore((s) => s.linkedClient);
  const portalLoaded     = useClientPortalStore((s) => s.isLoaded);
  const loadedForUserId  = useClientPortalStore((s) => s.loadedForUserId);
  const fetchPortal      = useClientPortalStore((s) => s.fetch);
  const { isTrainer, isDualRole, activeRole } = useDualRole();
  const location         = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Cheap one-shot lookup so portal-clients who hit a trainer URL get redirected
  // away instead of being pushed through onboarding. Refetch when the auth user
  // changes so we don't read stale data from a previous user's session.
  useEffect(() => {
    if (user && loadedForUserId !== user.id) fetchPortal();
  }, [user, loadedForUserId, fetchPortal]);

  const portalReady = portalLoaded && loadedForUserId === (user?.id ?? null);

  // Wait for all stores that affect feature gating — prevents flash of trial UI for admins
  const fullyLoaded = isLoaded && (
    !user || (settingsLoaded && userStoreLoaded && planStoreLoaded && portalReady)
  );

  useEffect(() => {
    if (fullyLoaded) return;
    const t = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [fullyLoaded]);

  // Loading — show spinner, or error if it took too long
  if (!fullyLoaded) {
    if (timedOut) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4 bg-gray-50 dark:bg-gray-900">
          <div className="text-4xl">⚡</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Taking too long</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Something went wrong while loading. Please refresh.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // No user → root path shows the public landing page; deeper paths bounce to login
  if (!user) {
    if (location.pathname === '/') {
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
          </div>
        }>
          <LandingPage />
        </Suspense>
      );
    }
    return <Navigate to="/login" replace />;
  }

  // Picker page handles its own routing — let it render even for single-role users.
  if (requireDualRole) return <>{children}</>;

  // Dual-role user without a stored choice → send them to the picker.
  if (isDualRole && !activeRole) return <Navigate to="/choose-role" replace />;

  // Dual-role user who picked 'client' → portal. Pure portal client → portal.
  if (linkedClient && (!isTrainer || activeRole === 'client')) {
    return <Navigate to="/client" replace />;
  }

  // No profile type → onboarding
  if (!profileType) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}
