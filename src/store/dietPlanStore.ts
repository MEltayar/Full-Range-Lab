import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dietPlanToDbRow } from '../lib/mappers';
import type { DietPlan, DietDay, DietMeal, DietMealItem } from '../types';
import { getAllDietPlans } from '../features/diet/services/dietPlanService';

interface DietPlanStore {
  plans: DietPlan[];
  isLoaded: boolean;
  draft: DietPlan | null;

  initializeFromDB: () => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  updatePlanStatus: (id: string, status: DietPlan['status']) => Promise<void>;

  startNewDraft: (clientId: string) => Promise<void>;
  loadDraftFromPlan: (plan: DietPlan) => void;
  clearDraft: () => void;
  saveDraft: () => Promise<void>;

  setDraftField: (
    field: 'name' | 'goal' | 'durationWeeks' | 'startDate' | 'clientId' | 'notes' | 'targetCalories' | 'targetProtein' | 'targetCarbs' | 'targetFat',
    value: string | number | undefined
  ) => void;

  addDay: () => void;
  updateDayLabel: (dayId: string, label: string) => void;
  deleteDay: (dayId: string) => void;

  addMeal: (dayId: string) => void;
  updateMealLabel: (dayId: string, mealId: string, label: string) => void;
  deleteMeal: (dayId: string, mealId: string) => void;

  addFoodToMeal: (dayId: string, mealId: string, foodItemId: string, quantity: number, servingMultiplier?: number, servingLabel?: string) => void;
  updateMealItemQuantity: (dayId: string, mealId: string, itemId: string, quantity: number) => void;
  updateMealItemNotes: (dayId: string, mealId: string, itemId: string, notes: string) => void;
  removeFoodFromMeal: (dayId: string, mealId: string, itemId: string) => void;
}

const DAY_LABELS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/** Map a weekday label to its `Date.getDay()` index (0=Sun…6=Sat). Returns undefined for non-weekday labels. */
function weekdayLabelToIndex(label: string): number | undefined {
  switch (label.trim().toLowerCase()) {
    case 'sunday':    return 0;
    case 'monday':    return 1;
    case 'tuesday':   return 2;
    case 'wednesday': return 3;
    case 'thursday':  return 4;
    case 'friday':    return 5;
    case 'saturday':  return 6;
    default:          return undefined;
  }
}
const MEAL_LABELS = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner'];

function mutateDraft(
  get: () => DietPlanStore,
  set: (partial: Partial<DietPlanStore>) => void,
  updater: (draft: DietPlan) => DietPlan
) {
  const { draft } = get();
  if (!draft) return;
  set({ draft: updater(draft) });
}

export const useDietPlanStore = create<DietPlanStore>((set, get) => ({
  plans: [],
  isLoaded: false,
  draft: null,

  initializeFromDB: async () => {
    if (get().isLoaded) return;
    const all = await getAllDietPlans();
    set({ plans: all, isLoaded: true });
  },

  deletePlan: async (id) => {
    const previous = get().plans;
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
    const { error } = await supabase.from('diet_plans').delete().eq('id', id);
    if (error) {
      set({ plans: previous });
      throw error;
    }
  },

  updatePlanStatus: async (id, status) => {
    const previous = get().plans;
    set((state) => ({
      plans: state.plans.map((p) => p.id === id ? { ...p, status } : p),
    }));
    const { error } = await supabase.from('diet_plans').update({ status }).eq('id', id);
    if (error) {
      set({ plans: previous });
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
        goal: '',
        durationWeeks: 4,
        startDate: new Date().toISOString().split('T')[0],
        days: [],
        notes: undefined,
        targetCalories: undefined,
        targetProtein: undefined,
        targetCarbs: undefined,
        targetFat: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id,
      },
    });
  },

  loadDraftFromPlan: (plan) => {
    set({ draft: { ...plan } });
  },

  clearDraft: () => set({ draft: null }),

  saveDraft: async () => {
    const { draft, plans } = get();
    if (!draft) return;
    const now = new Date().toISOString();
    const updated = { ...draft, updatedAt: now };
    const row = dietPlanToDbRow(updated);
    const existing = plans.find((p) => p.id === draft.id);
    if (existing) {
      const { error } = await supabase.from('diet_plans').update(row).eq('id', draft.id);
      if (error) throw error;
      set((state) => ({
        plans: state.plans.map((p) => (p.id === draft.id ? updated : p)),
        draft: updated,
      }));
    } else {
      const { error } = await supabase.from('diet_plans').insert(row);
      if (error) throw error;
      set((state) => ({ plans: [updated, ...state.plans], draft: updated }));
    }
  },

  setDraftField: (field, value) => {
    mutateDraft(get, set, (d) => ({ ...d, [field]: value }));
  },

  addDay: () => {
    mutateDraft(get, set, (d) => {
      const label = DAY_LABELS[d.days.length] ?? `Day ${d.days.length + 1}`;
      const newDay: DietDay = {
        id: crypto.randomUUID(),
        label,
        dayOfWeek: weekdayLabelToIndex(label),
        meals: [],
      };
      return { ...d, days: [...d.days, newDay] };
    });
  },

  updateDayLabel: (dayId, label) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id === dayId
          ? { ...day, label, dayOfWeek: weekdayLabelToIndex(label) }
          : day,
      ),
    }));
  },

  deleteDay: (dayId) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.filter((day) => day.id !== dayId),
    }));
  },

  addMeal: (dayId) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) => {
        if (day.id !== dayId) return day;
        const label = MEAL_LABELS[day.meals.length] ?? `Meal ${day.meals.length + 1}`;
        const newMeal: DietMeal = { id: crypto.randomUUID(), label, items: [] };
        return { ...day, meals: [...day.meals, newMeal] };
      }),
    }));
  },

  updateMealLabel: (dayId, mealId, label) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.map((m) => (m.id === mealId ? { ...m, label } : m)),
        }
      ),
    }));
  },

  deleteMeal: (dayId, mealId) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.filter((m) => m.id !== mealId),
        }
      ),
    }));
  },

  addFoodToMeal: (dayId, mealId, foodItemId, quantity, servingMultiplier, servingLabel) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.map((m) => {
            if (m.id !== mealId) return m;
            const item: DietMealItem = {
              id: crypto.randomUUID(),
              foodItemId,
              quantity,
              ...(servingMultiplier !== undefined ? { servingMultiplier } : {}),
              ...(servingLabel      !== undefined ? { servingLabel      } : {}),
            };
            return { ...m, items: [...m.items, item] };
          }),
        }
      ),
    }));
  },

  updateMealItemQuantity: (dayId, mealId, itemId, quantity) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.map((m) =>
            m.id !== mealId ? m : {
              ...m,
              items: m.items.map((it) => (it.id === itemId ? { ...it, quantity } : it)),
            }
          ),
        }
      ),
    }));
  },

  updateMealItemNotes: (dayId, mealId, itemId, notes) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.map((m) =>
            m.id !== mealId ? m : {
              ...m,
              items: m.items.map((it) => (it.id === itemId ? { ...it, notes } : it)),
            }
          ),
        }
      ),
    }));
  },

  removeFoodFromMeal: (dayId, mealId, itemId) => {
    mutateDraft(get, set, (d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.map((m) =>
            m.id !== mealId ? m : {
              ...m,
              items: m.items.filter((it) => it.id !== itemId),
            }
          ),
        }
      ),
    }));
  },
}));
