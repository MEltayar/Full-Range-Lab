import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToSessionLog, sessionLogToDbRow } from '../lib/mappers';
import type { ClientSessionLog } from '../types';

type SessionLogPatch = Partial<Pick<ClientSessionLog, 'notes' | 'exercises'>>;

interface ClientSessionLogStore {
  logs: ClientSessionLog[];
  isLoaded: boolean;
  loadForClient: (clientId: string) => Promise<void>;
  addLog: (data: Omit<ClientSessionLog, 'id' | 'createdAt'>) => Promise<void>;
  updateLog: (id: string, patch: SessionLogPatch) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export const useClientSessionLogStore = create<ClientSessionLogStore>((set, get) => ({
  logs: [],
  isLoaded: false,

  loadForClient: async (clientId) => {
    set({ isLoaded: false });
    try {
      const { data, error } = await supabase
        .from('client_session_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('logged_at', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ logs: (data ?? []).map(dbRowToSessionLog), isLoaded: true });
    } catch {
      set({ logs: [], isLoaded: true });
    }
  },

  addLog: async (data) => {
    const log: ClientSessionLog = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('client_session_logs')
      .insert({ ...sessionLogToDbRow(log), user_id: user?.id });
    if (error) throw error;
    set((s) => ({ logs: [log, ...s.logs] }));
  },

  updateLog: async (id, patch) => {
    const previous = get().logs;
    set((s) => ({ logs: s.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    const dbPatch: Record<string, unknown> = {};
    if ('notes' in patch) dbPatch.notes = patch.notes ?? null;
    if ('exercises' in patch) dbPatch.exercises = patch.exercises;
    const { error } = await supabase.from('client_session_logs').update(dbPatch).eq('id', id);
    if (error) {
      set({ logs: previous });
      throw error;
    }
  },

  deleteLog: async (id) => {
    const previous = get().logs;
    set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
    const { error } = await supabase.from('client_session_logs').delete().eq('id', id);
    if (error) {
      set({ logs: previous });
      throw error;
    }
  },
}));
