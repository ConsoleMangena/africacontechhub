import axios, { AxiosInstance } from 'axios'
import { supabase } from './supabase'

/**
 * API client instance with automatic authentication token injection
 * Base URL should not include /api/v1 as endpoints include it in their paths
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Cache the session to avoid repeated async calls
let cachedSession: string | null = null

// Update cached session when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = session?.access_token || null
})

// Initialize cached session (ignore errors so app loads without backend/Supabase)
supabase.auth.getSession().then(
  ({ data: { session } }) => {
    cachedSession = session?.access_token || null
  },
  () => {
    cachedSession = null
  }
)

// Add a request interceptor to inject the Supabase token
apiClient.interceptors.request.use(
  (config) => {
    if (cachedSession) {
      config.headers.Authorization = `Bearer ${cachedSession}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors by attempting to refresh the session
    if (error.response?.status === 401) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          cachedSession = session.access_token
          // Retry the original request with the new token
          error.config.headers.Authorization = `Bearer ${session.access_token}`
          return apiClient.request(error.config)
        }
      } catch (refreshError) {
        // If refresh fails, sign out
        await supabase.auth.signOut()
        cachedSession = null
      }
    }
    return Promise.reject(error)
  }
)

export { apiClient }
