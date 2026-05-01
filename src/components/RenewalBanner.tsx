import { usePlanStore } from '../store/planStore';

const RENEWAL_WINDOW_DAYS = 7;

export default function RenewalBanner() {
  const daysLeft               = usePlanStore((s) => s.subscriptionDaysLeft());
  const isSubscriptionExpired  = usePlanStore((s) => s.isSubscriptionExpired());
  const isLoaded               = usePlanStore((s) => s.isLoaded);

  if (!isLoaded) return null;
  if (isSubscriptionExpired) return null;
  if (daysLeft === null) return null;
  if (daysLeft > RENEWAL_WINDOW_DAYS) return null;

  const urgent = daysLeft <= 1;

  return (
    <div className={`shrink-0 flex items-center justify-between gap-4 px-4 py-2 text-sm border-b ${
      urgent
        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        : 'border-orange-200 dark:border-orange-800/50'
    }`}
      style={urgent ? undefined : { background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(220,38,38,0.06))' }}>
      <span className={urgent ? '' : 'text-orange-700 dark:text-orange-300'}>
        {daysLeft === 0
          ? 'Your subscription ends today — renew to keep access.'
          : daysLeft === 1
            ? 'Your subscription ends tomorrow — renew to keep access.'
            : `Your subscription ends in ${daysLeft} days — send a renewal payment to stay active.`}
      </span>
    </div>
  );
}
