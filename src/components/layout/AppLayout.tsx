import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { BrandTile } from '../Brand';
import ToastContainer from '../ui/ToastContainer';
import ConfirmDialog from '../ui/ConfirmDialog';
import TrialBanner from '../TrialBanner';
import RenewalBanner from '../RenewalBanner';
import TrialExpiredWall from '../TrialExpiredWall';
import SubscriptionExpiredWall from '../SubscriptionExpiredWall';
import FeedbackButton from '../FeedbackButton';
import { usePlanStore } from '../../store/planStore';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isTrialExpired        = usePlanStore((s) => s.isTrialExpired());
  const isSubscriptionExpired = usePlanStore((s) => s.isSubscriptionExpired());
  const isPlanLoaded          = usePlanStore((s) => s.isLoaded);

  if (isPlanLoaded && isSubscriptionExpired) return <SubscriptionExpiredWall />;
  if (isPlanLoaded && isTrialExpired)        return <TrialExpiredWall />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Full Range Lab</span>
          </div>
        </header>

        <TrialBanner />
        <RenewalBanner />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
      <ConfirmDialog />
      <FeedbackButton />
    </div>
  );
}
