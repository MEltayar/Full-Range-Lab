import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const ACTIVITY_WINDOW_DAYS = 7;

interface ClientActivityStore {
  recentClientIds: Set<string>;
  isLoaded: boolean;
  load: () => Promise<void>;
}

// "Recently active" = the client (or trainer logging on their behalf) created
// a check-in, progress photo, or session log within the last 7 days. Used
// only for a low-value indicator on the client list — failure is silently
// swallowed so a slow query never blocks the page.
export const useClientActivityStore = create<ClientActivityStore>((set) => ({
  recentClientIds: new Set(),
  isLoaded: false,

  load: async () => {
    const cutoff = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * 86_400_000).toISOString();
    const tables = ['client_check_ins', 'client_progress_photos', 'client_session_logs'] as const;
    try {
      const results = await Promise.all(
        tables.map((t) =>
          supabase.from(t).select('client_id').gte('created_at', cutoff),
        ),
      );
      const ids = new Set<string>();
      for (const { data } of results) {
        if (!data) continue;
        for (const row of data as { client_id: string | null }[]) {
          if (row.client_id) ids.add(row.client_id);
        }
      }
      set({ recentClientIds: ids, isLoaded: true });
    } catch {
      set({ recentClientIds: new Set(), isLoaded: true });
    }
  },
}));
