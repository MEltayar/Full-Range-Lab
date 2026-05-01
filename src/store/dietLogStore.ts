import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbRowToDietLog, dietLogToDbRow } from '../lib/mappers';
import type { DietLog } from '../types';

interface DietLogStore {
  logs: DietLog[];
  isLoaded: boolean;
  loadForClient: (clientId: string) => Promise<void>;
  upsert: (data: {
    clientId: string;
    planId: string;
    dayId: string;
    mealId: string;
    date: string;
    eaten?: boolean;
    notes?: string;
  }) => Promise<void>;
}

export const useDietLogStore = create<DietLogStore>((set, get) => ({
  logs: [],
  isLoaded: false,

  loadForClient: async (clientId) => {
    set({ isLoaded: false });
    try {
      const { data, error } = await supabase
        .from('diet_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) throw error;
      set({ logs: (data ?? []).map(dbRowToDietLog), isLoaded: true });
    } catch {
      set({ logs: [], isLoaded: true });
    }
  },

  upsert: async ({ clientId, planId, dayId, mealId, date, eaten, notes }) => {
    const existing = get().logs.find(
      (l) =>
        l.clientId === clientId &&
        l.planId   === planId   &&
        l.dayId    === dayId    &&
        l.mealId   === mealId   &&
        l.date     === date
    );
    const now = new Date().toISOString();
    const previous = get().logs;

    if (existing) {
      const next: DietLog = {
        ...existing,
        eaten: eaten ?? existing.eaten,
        notes: notes !== undefined ? notes : existing.notes,
        updatedAt: now,
      };
      set({ logs: previous.map((l) => (l.id === next.id ? next : l)) });
      try {
        const { error } = await supabase
          .from('diet_logs')
          .update({
            eaten: next.eaten,
            notes: next.notes ?? null,
            updated_at: next.updatedAt,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } catch (err) {
        set({ logs: previous });
        throw err;
      }
      return;
    }

    const next: DietLog = {
      id: crypto.randomUUID(),
      clientId,
      planId,
      dayId,
      mealId,
      date,
      eaten: eaten ?? false,
      notes,
      createdAt: now,
      updatedAt: now,
    };
    set({ logs: [next, ...previous] });
    try {
      const { error } = await supabase
        .from('diet_logs')
        .insert(dietLogToDbRow(next));
      if (error) throw error;
    } catch (err) {
      set({ logs: previous });
      throw err;
    }
  },
}));
