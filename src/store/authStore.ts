import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoaded: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoaded: false,

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Stale/corrupted token — wipe it so next load starts clean
        supabase.auth.signOut().catch(() => {});
        set({ session: null, user: null, isLoaded: true });
        return;
      }
      set({ session, user: session?.user ?? null, isLoaded: true });
    }).catch(() => {
      set({ isLoaded: true });
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if ((event as string) === 'TOKEN_REFRESH_FAILED') {
        // Expired or revoked refresh token — sign out to clear stale localStorage entry
        supabase.auth.signOut().catch(() => {});
        set({ session: null, user: null, isLoaded: true });
        return;
      }
      set({ session, user: session?.user ?? null, isLoaded: true });
    });
  },

  signIn: async (email, password, rememberMe = true) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // If "remember me" is off, remove the persisted token from localStorage
    // so the session doesn't survive a full browser restart (still works in-tab)
    if (!rememberMe) {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key);
          break;
        }
      }
    }
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // If session is null after signup, email confirmation is required
    return { needsConfirmation: !data.session };
  },

  signOut: async () => {
    // Clear the dual-role picker choice so the next user on this browser
    // doesn't inherit our active-role flag.
    try { localStorage.removeItem('frl_active_role'); } catch { /* ignore */ }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { password_set: true },
    });
    if (error) throw error;
  },
}));
