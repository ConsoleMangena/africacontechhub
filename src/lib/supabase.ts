import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('placeholder')
)

if (!isSupabaseConfigured) {
  console.error(
    '⚠️ Supabase credentials are missing or invalid!\n' +
    'Please configure your .env file with:\n' +
    'VITE_SUPABASE_URL=your_supabase_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n' +
    'Get these from: https://app.supabase.com → Your Project → Settings → API\n\n' +
    'Authentication features will not work until Supabase is configured.'
  )
}

// Only create client if configured, otherwise create with dummy values
// The client will fail with network errors, but we'll catch those in the UI
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://not-configured.supabase.co', 'not-configured-key')
