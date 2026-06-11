import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}

interface AuthState {
  /** The user ID from Supabase auth, or null if not logged in */
  userId: string | null;
  /** Whether auth has finished loading (session checked) */
  loading: boolean;
  /** Whether the current user is an admin */
  isAdmin: boolean;
  /** User profile (name, email, role) */
  profile: Profile | null;
  /** Supabase Auth Session Token */
  token: string | null;

  /** Initialize: check session, fetch profile and set up listener */
  initialize: () => Promise<void>;
  /** Set profile data */
  setProfile: (profile: Profile) => void;
  /** Sign out — clears session and local state */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userId: null,
  loading: true,
  isAdmin: false,
  profile: null,
  token: null,

  initialize: async () => {
    // 1. Initial Session Check
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const handleSession = async (currentSession: typeof session) => {
      if (!currentSession) {
        set({ userId: null, loading: false, isAdmin: false, profile: null, token: null });
        return;
      }

      const userId = currentSession.user.id;
      const token = currentSession.access_token;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', userId)
        .single();

      set({
        userId,
        token,
        loading: false,
        isAdmin: profile?.role === 'admin',
        profile: profile
          ? { id: userId, full_name: profile.full_name, email: profile.email, role: profile.role }
          : null,
      });
    };

    await handleSession(session);

    // 2. Setup Auth State Listener (Merge from AdminSessionProvider)
    supabase.auth.onAuthStateChange((_event, currentSession) => {
      handleSession(currentSession);
    });
  },

  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ userId: null, loading: false, isAdmin: false, profile: null, token: null });
  },
}));
