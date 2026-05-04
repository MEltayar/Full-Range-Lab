import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDualRole, type ActiveRole } from '../hooks/useDualRole';
import { BrandTile } from '../components/Brand';

export default function RolePickerPage() {
  const navigate = useNavigate();
  const { isDualRole, isTrainer, isLinkedClient, linkedClientId, setActiveRole } = useDualRole();
  const [trainerName, setTrainerName] = useState<string | null>(null);

  // Single-role users shouldn't be here — bounce them to wherever they belong.
  useEffect(() => {
    if (!isDualRole) {
      if (isTrainer) navigate('/', { replace: true });
      else if (isLinkedClient) navigate('/client', { replace: true });
      else navigate('/login', { replace: true });
    }
  }, [isDualRole, isTrainer, isLinkedClient, navigate]);

  // Look up the inviting trainer's display name for the client-card label.
  // Two-step lookup because the Client mapper doesn't expose user_id.
  useEffect(() => {
    if (!linkedClientId) return;
    let cancelled = false;
    (async () => {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', linkedClientId)
        .maybeSingle();
      if (cancelled || !clientRow?.user_id) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', clientRow.user_id)
        .maybeSingle();
      if (!cancelled) setTrainerName(profile?.display_name ?? null);
    })();
    return () => { cancelled = true; };
  }, [linkedClientId]);

  function pick(role: ActiveRole) {
    setActiveRole(role);
    navigate(role === 'trainer' ? '/' : '/client', { replace: true });
  }

  if (!isDualRole) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center gap-3 mb-10">
          <BrandTile className="w-14 h-14 rounded-2xl" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Choose your view</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            This account is linked as both a trainer and a client. Pick which side to use — you can switch any time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => pick('trainer')}
            className="group flex flex-col items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100">Continue as trainer</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your own clients, programs, and diet plans.
              </p>
            </div>
          </button>

          <button
            onClick={() => pick('client')}
            className="group flex flex-col items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <User size={22} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                Continue as client{trainerName ? ` of ${trainerName}` : ''}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View your training plan, log sessions, and track your progress.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
