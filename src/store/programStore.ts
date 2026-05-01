import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from '../lib/supabase';
import { programToDbRow } from '../lib/mappers';
import type { Program, Session, ProgramExercise, Template } from '../types';
import { getAllPrograms } from '../features/programs/services/programService';
import { usePlanStore } from './planStore';
import { useSettingsStore } from './settingsStore';
import { readListCache, writeListCache } from '../lib/storeCache';

interface ProgramStore {
  programs: Program[];
  isLoaded: boolean;
  draft: Program | null;

  initializeFromDB: () => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  updateProgramStatus: (id: string, status: Program['status']) => Promise<void>;

  startNewDraft: (clientId: string) => Promise<void>;
  loadDraftFromProgram: (program: Program) => void;
  loadDraftFromTemplate: (template: Template) => Promise<void>;
  clearDraft: () => void;
  saveDraft: () => Promise<void>;

  setDraftField: (
    field: 'name' | 'condition' | 'goal' | 'durationWeeks' | 'startDate' | 'clientId',
    value: string | number
  ) => void;

  addSession: () => void;
  updateSessionLabel: (sessionId: string, label: string) => void;
  updateSessionDayOfWeek: (sessionId: string, dayOfWeek: number | undefined) => void;
  deleteSession: (sessionId: string) => void;

  addExerciseToSession: (sessionId: string, exerciseId: string) => void;
  updateExerciseParams: (
    sessionId: string,
    programExerciseId: string,
    params: Partial<Pick<ProgramExercise, 'sets' | 'reps' | 'holdTime' | 'weightKg' | 'restSeconds' | 'notes'>>
  ) => void;
  removeExerciseFromSession: (sessionId: string, programExerciseId: string) => void;
  reorderExercisesInSession: (sessionId: string, oldIndex: number, newIndex: number) => void;
  reorderSessions: (oldIndex: number, newIndex: number) => void;
}

export const useProgramStore = create<ProgramStore>((set, get) => ({
  programs: [],
  isLoaded: false,
  draft: null,

  initializeFromDB: async () => {
    if (get().isLoaded) return;

    const cached = readListCache<Program>('programs');
    if (cached) {
      set({ programs: cached, isLoaded: true });
      getAllPrograms()
        .then((fresh) => {
          writeListCache('programs', fresh);
          set({ programs: fresh });
        })
        .catch((err) => console.error('[programStore] background refresh failed:', err));
      return;
    }

    const all = await getAllPrograms();
    writeListCache('programs', all);
    set({ programs: all, isLoaded: true });
  },

  deleteProgram: async (id) => {
    const previous = get().programs;
    set((state) => ({ programs: state.programs.filter((p) => p.id !== id) }));
    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete program:', err);
      set({ programs: previous });
      throw err;
    }
  },

  updateProgramStatus: async (id, status) => {
    const previous = get().programs;
    set((state) => ({
      programs: state.programs.map((p) => p.id === id ? { ...p, status } : p),
    }));
    const { error } = await supabase.from('programs').update({ status }).eq('id', id);
    if (error) {
      set({ programs: previous });
      throw error;
    }
  },

  startNewDraft: async (clientId) => {
    const { data: { user } } = await supabase.auth.getUser();
    set({
      draft: {
        id: crypto.randomUUID(),
        clientId,
        name: '',
        condition: '',
        goal: useSettingsStore.getState().profileType === 'gym'
          ? 'Build strength and improve body composition.'
          : 'Reduce pain and restore normal movement.',
        durationWeeks: 4,
        startDate: new Date().toISOString().split('T')[0],
        sessions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id,
      },
    });
  },

  loadDraftFromProgram: (program) => {
    set({ draft: JSON.parse(JSON.stringify(program)) });
  },

  loadDraftFromTemplate: async (template) => {
    const { data: { user } } = await supabase.auth.getUser();
    set({
      draft: {
        id: crypto.randomUUID(),
        clientId: '',
        name: template.name,
        condition: template.condition,
        goal: useSettingsStore.getState().profileType === 'gym'
          ? 'Build strength and improve body composition.'
          : 'Reduce pain and restore normal movement.',
        durationWeeks: 4,
        startDate: new Date().toISOString().split('T')[0],
        sessions: JSON.parse(JSON.stringify(template.sessions)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id,
      },
    });
  },

  clearDraft: () => set({ draft: null }),

  saveDraft: async () => {
    const { draft, programs } = get();
    if (!draft) throw new Error('No draft to save');

    // Always resolve the current user so user_id is never missing in the DB row
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated. Please sign in again.');

    // Enforce program limit for new programs only (not edits)
    const isNew = !programs.some((p) => p.id === draft.id);
    if (isNew && draft.clientId) {
      const { maxProgramsPerClient } = usePlanStore.getState().limits();
      const clientProgramCount = programs.filter((p) => p.clientId === draft.clientId).length;
      if (clientProgramCount >= maxProgramsPerClient) {
        throw new Error(`Program limit reached. Trial accounts can only have ${maxProgramsPerClient} programs per client. Upgrade to Pro for unlimited programs.`);
      }
    }

    const updated: Program = { ...draft, updatedAt: new Date().toISOString(), userId: user.id };
    const { error } = await supabase
      .from('programs')
      .upsert(programToDbRow(updated));
    if (error) throw error;
    const exists = programs.some((p) => p.id === updated.id);
    set({
      draft: updated,
      programs: exists
        ? programs.map((p) => (p.id === updated.id ? updated : p))
        : [...programs, updated],
    });
  },

  setDraftField: (field, value) => {
    set((state) => {
      if (!state.draft) return state;
      return { draft: { ...state.draft, [field]: value } };
    });
  },

  addSession: () => {
    set((state) => {
      if (!state.draft) return state;
      const n = state.draft.sessions.length + 1;
      const newSession: Session = {
        id: crypto.randomUUID(),
        label: `Session ${n}`,
        exercises: [],
      };
      return { draft: { ...state.draft, sessions: [...state.draft.sessions, newSession] } };
    });
  },

  updateSessionLabel: (sessionId, label) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) =>
            s.id === sessionId ? { ...s, label } : s
          ),
        },
      };
    });
  },

  updateSessionDayOfWeek: (sessionId, dayOfWeek) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) =>
            s.id === sessionId ? { ...s, dayOfWeek } : s
          ),
        },
      };
    });
  },

  deleteSession: (sessionId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.filter((s) => s.id !== sessionId),
        },
      };
    });
  },

  addExerciseToSession: (sessionId, exerciseId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const newExercise: ProgramExercise = {
              id: crypto.randomUUID(),
              exerciseId,
              order: s.exercises.length,
            };
            return { ...s, exercises: [...s.exercises, newExercise] };
          }),
        },
      };
    });
  },

  updateExerciseParams: (sessionId, programExerciseId, params) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            return {
              ...s,
              exercises: s.exercises.map((ex) =>
                ex.id === programExerciseId ? { ...ex, ...params } : ex
              ),
            };
          }),
        },
      };
    });
  },

  removeExerciseFromSession: (sessionId, programExerciseId) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const filtered = s.exercises.filter((ex) => ex.id !== programExerciseId);
            return {
              ...s,
              exercises: filtered.map((ex, i) => ({ ...ex, order: i })),
            };
          }),
        },
      };
    });
  },

  reorderExercisesInSession: (sessionId, oldIndex, newIndex) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: state.draft.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const reordered = arrayMove(s.exercises, oldIndex, newIndex).map((ex, i) => ({
              ...ex,
              order: i,
            }));
            return { ...s, exercises: reordered };
          }),
        },
      };
    });
  },

  reorderSessions: (oldIndex, newIndex) => {
    set((state) => {
      if (!state.draft) return state;
      return {
        draft: {
          ...state.draft,
          sessions: arrayMove(state.draft.sessions, oldIndex, newIndex),
        },
      };
    });
  },
}));

useProgramStore.subscribe((state, prev) => {
  if (state.programs !== prev.programs && state.isLoaded) {
    writeListCache('programs', state.programs);
  }
});
