import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToClientCheckIn, clientCheckInToDbRow } from '../lib/mappers';
import type { ClientCheckIn } from '../types';

interface ClientCheckInStore {
  checkIns: ClientCheckIn[];
  isLoaded: boolean;
  loadForClient: (clientId: string) => Promise<void>;
  addCheckIn: (data: Omit<ClientCheckIn, 'id' | 'createdAt'>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
}

export const useClientCheckInStore = create<ClientCheckInStore>((set, get) => ({
  checkIns: [],
  isLoaded: false,

  loadForClient: async (clientId: string) => {
    set({ isLoaded: false });
    try {
      const { data, error } = await supabase
        .from('client_check_ins')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ checkIns: (data ?? []).map(dbRowToClientCheckIn), isLoaded: true });
    } catch {
      // Table may not exist yet — fail gracefully
      set({ checkIns: [], isLoaded: true });
    }
  },

  addCheckIn: async (data) => {
    const checkIn: ClientCheckIn = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('client_check_ins')
        .insert({ ...clientCheckInToDbRow(checkIn), user_id: user?.id });
      if (error) throw error;
      set((s) => ({ checkIns: [checkIn, ...s.checkIns] }));
    } catch (err) {
      console.error('Failed to save check-in:', err);
      throw err;
    }
  },

  deleteCheckIn: async (id) => {
    const previous = get().checkIns;
    set((s) => ({ checkIns: s.checkIns.filter((c) => c.id !== id) }));
    const { error } = await supabase.from('client_check_ins').delete().eq('id', id);
    if (error) {
      set({ checkIns: previous });
      throw error;
    }
  },
}));
