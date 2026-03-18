import { create } from 'zustand'
import { AxiosError } from 'axios'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import { User } from '@/types/api'

// Track backend availability to avoid spamming requests when API is down
let backendUnavailable = false
let backendWarned = false

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
        if (!userData) throw new Error('Failed to fetch profile');
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

        // Redirect unapproved users (non-ADMIN) to pending screen
        // is_approved is explicitly false (not null/undefined) — this protects against legacy users
        if (profile && profile.is_approved === false && profile.role !== 'ADMIN') {
          if (window.location.pathname !== '/pending-approval') {
            window.location.href = '/pending-approval';
          }
        }
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
        if (backendUnavailable) {
          set((state) => ({ auth: { ...state.auth, isLoading: false } }))
          return
        }

        if (session) {
          try {
            const response = await apiClient.get('/api/v1/auth/me/')
            const userData = response.data
            if (!userData) throw new Error('Failed to fetch profile')
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

            // Redirect unapproved users to the pending screen
            // Only block if explicitly false — protects pre-existing accounts
            if (profile && profile.is_approved === false && profile.role !== 'ADMIN') {
              if (window.location.pathname !== '/pending-approval') {
                window.location.href = '/pending-approval'
              }
            }
          } catch (error) {
            if (
              error instanceof AxiosError &&
              error.response?.status === 401
            ) {
              // Clear stale/invalid session so app can recover cleanly.
              await supabase.auth.signOut()
              set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }))
              return
            }

            if (
              error instanceof Error &&
              error.message.includes('Invalid token')
            ) {
              await supabase.auth.signOut()
              set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }))
              return
            }

            if (!backendUnavailable && error instanceof Error && error.message.includes('Backend unreachable')) {
              backendUnavailable = true
              if (!backendWarned) {
                console.warn(error.message)
                backendWarned = true
              }
              set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }))
              return
            }
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

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        await syncUserFromBackend(session)

        // Listen for changes (sign-in, sign-out, token refresh)
        supabase.auth.onAuthStateChange(async (_event, newSession) => {
          await syncUserFromBackend(newSession)
        })
      } catch (error) {
        // Supabase or network unreachable (e.g. not configured, backend down)
        console.warn('Auth init failed (Supabase/network):', error)
        set((state) => ({
          auth: { ...state.auth, user: null, isLoading: false },
        }))
      }
    },

    reset: () =>
      set((state) => ({
        auth: { ...state.auth, user: null, isLoading: false },
      })),
  },
}))
