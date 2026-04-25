import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api-client'
import type { User } from '@/types/api'

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

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

function isUnauthorizedMessage(message?: string) {
  const text = (message || '').toLowerCase()
  return text.includes('unauthorized') || text.includes('401')
}

async function fetchProfileWithRefreshRetry(): Promise<User> {
  const readProfile = async () => {
    const response = (await apiClient.get('/api/v1/auth/me/')) as ApiResponse<User>
    if (response.success && response.data) return response.data
    throw new Error(response.message || 'Failed to fetch profile')
  }

  try {
    return await readProfile()
  } catch (error) {
    if (!(error instanceof Error) || !isUnauthorizedMessage(error.message)) {
      throw error
    }
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshed.session) {
      throw error
    }
    return readProfile()
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    isLoading: true,

    login: async () => {
      try {
        set((state) => ({ auth: { ...state.auth, isLoading: true } }))
        // Prefer local session over getUser() network call.
        // In some environments, browser/extension/network layers can abort the getUser request.
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        const supabaseUser = session?.user
        if (error || !supabaseUser) throw error || new Error('No active session')

        const userData = await fetchProfileWithRefreshRetry()
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
              role: userData.role,
            },
            isLoading: false,
          },
        }))

        // Redirect unapproved users (non-ADMIN) to pending screen
        // is_approved is explicitly false (not null/undefined) — this protects against legacy users
        if (profile && profile.is_approved === false && profile.role !== 'ADMIN') {
          if (window.location.pathname !== '/pending-approval') {
            window.location.href = '/pending-approval'
          }
        }
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) {
          set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }))
          return
        }
        console.error('Login failed:', error)
        set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }))
        throw error
      }
    },

    logout: async () => {
      await supabase.auth.signOut()
      set((state) => ({ auth: { ...state.auth, user: null } }))
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
            const userData = await fetchProfileWithRefreshRetry()
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
                  role: userData.role,
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
            if (error instanceof Error && isUnauthorizedMessage(error.message)) {
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

            if (
              !backendUnavailable &&
              error instanceof Error &&
              (error.message.includes('Backend unreachable') || error.message.includes('Network Error'))
            ) {
              backendUnavailable = true
              if (!backendWarned) {
                console.warn('Backend is currently unreachable. Continuing with limited functionality.')
                backendWarned = true
              }
              set((state) => ({ auth: { ...state.auth, user: null, isLoading: false } }))
              return
            }
            if (backendUnavailable) return // Prevent spam

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
      } catch (error: any) {
        if (error?.name === 'AbortError' || error?.message?.includes('AbortError')) {
          // Ignore fetch aborts caused by React Strict Mode double-invocations
          return
        }
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
