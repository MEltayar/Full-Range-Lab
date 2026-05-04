import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useClientPortalStore } from '../store/clientPortalStore';
import { useDualRole } from '../hooks/useDualRole';
import ClientSetPasswordPage from '../features/clientPortal/pages/ClientSetPasswordPage';
import ClientSubscriptionExpiredWall from '../features/clientPortal/pages/ClientSubscriptionExpiredWall';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );
}

export default function ClientProtectedRoute({ children }: { children: React.ReactNode }) {
  const user            = useAuthStore((s) => s.user);
  const authLoaded      = useAuthStore((s) => s.isLoaded);
  const linkedClient    = useClientPortalStore((s) => s.linkedClient);
  const portalLoaded    = useClientPortalStore((s) => s.isLoaded);
  const loadedForUserId = useClientPortalStore((s) => s.loadedForUserId);
  const fetchPortal     = useClientPortalStore((s) => s.fetch);
  const { isDualRole, activeRole } = useDualRole();

  // Treat the portal as un-loaded if the cached state belongs to a different
  // auth user — prevents a "Not a portal client" flash when the magic-link
  // sign-in switches users while the store still has the previous fetch.
  const portalReady = portalLoaded && loadedForUserId === (user?.id ?? null);

  useEffect(() => {
    if (user && loadedForUserId !== user.id) fetchPortal();
  }, [user, loadedForUserId, fetchPortal]);

  if (!authLoaded) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!portalReady) return <Spinner />;

  // Dual-role user without a stored choice → picker.
  if (isDualRole && !activeRole) return <Navigate to="/choose-role" replace />;

  // Dual-role user who picked 'trainer' → trainer side, even though they
  // navigated to /client.
  if (isDualRole && activeRole === 'trainer') return <Navigate to="/" replace />;

  if (!linkedClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Not a portal client</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This account isn't linked to a client portal. If you're the trainer, head to the dashboard.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  // First-time clients arrive via magic link with no password. Force them to set one
  // before entering the portal so they can sign back in by email + password later.
  if (!user.user_metadata?.password_set) {
    return <ClientSetPasswordPage />;
  }

  // Engagement window: if the trainer set an end date and it's already in the past,
  // lock the portal until they renew. No date set = open-ended (no expiry).
  if (linkedClient.subscriptionEndDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (linkedClient.subscriptionEndDate < today) {
      return <ClientSubscriptionExpiredWall endDate={linkedClient.subscriptionEndDate} />;
    }
  }

  return <>{children}</>;
}
