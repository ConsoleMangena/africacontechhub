import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import { User } from '@/types/api'

interface AuthState {
  auth: {
    user: User | null
    isLoading: boolean
    login: () => Promise<void>
    logout: () => Promise<void>
    initialize: () => Promise<void>
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    isLoading: true,

    login: async () => {
      try {
        set((state) => ({ auth: { ...state.auth, isLoading: true } }));
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

        if (error || !supabaseUser) throw error;

        // Fetch profile from Django
        const response = await apiClient.get('/api/v1/auth/me/');
        const userData = response.data;
        const profile = userData.profile;

        set((state) => ({
          auth: {
            ...state.auth,
            user: {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              first_name: userData.first_name,
              last_name: userData.last_name,
              profile,
            },
            isLoading: false,
          }
        }));
      } catch (error) {
        console.error('Login failed:', error);
        set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }));
      }
    },

    logout: async () => {
      await supabase.auth.signOut();
      set((state) => ({ auth: { ...state.auth, user: null } }));
    },

    initialize: async () => {
      set((state) => ({ auth: { ...state.auth, isLoading: true } }))

      const syncUserFromBackend = async (session: Session | null) => {
        if (session) {
          try {
            const response = await apiClient.get('/api/v1/auth/me/')
            const userData = response.data
            const profile = userData.profile

            set((state) => ({
              auth: {
                ...state.auth,
                user: {
                  id: userData.id,
                  username: userData.username,
                  email: userData.email,
                  first_name: userData.first_name,
                  last_name: userData.last_name,
                  profile,
                },
                isLoading: false,
              },
            }))
          } catch (error) {
            console.error('Failed to fetch profile on init/auth change:', error)
            set((state) => ({
              auth: { ...state.auth, user: null, isLoading: false },
            }))
          }
        } else {
          set((state) => ({
            auth: { ...state.auth, user: null, isLoading: false },
          }))
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()
      await syncUserFromBackend(session)

      // Listen for changes (sign-in, sign-out, token refresh)
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        await syncUserFromBackend(newSession)
      })
    },

    reset: () =>
      set((state) => ({
        auth: { ...state.auth, user: null, isLoading: false },
      })),
  },
}))
