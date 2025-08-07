import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Please check your .env file contains:')
  console.log('VITE_SUPABASE_URL=your_supabase_url')
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
}

if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
  console.log('🔗 Connecting to Supabase:', supabaseUrl)
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Test connection on initialization
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
  supabase.auth.getSession()
    .then(() => {
      console.log('✅ Supabase connection established')
    })
    .catch((error) => {
      console.error('❌ Supabase connection failed:', error.message)
      console.log('Please verify:')
      console.log('1. Your Supabase project URL is correct')
      console.log('2. Your Supabase project is active (not paused)')
      console.log('3. Your network connection is working')
      console.log('4. Check your Supabase dashboard at https://supabase.com/dashboard/projects')
    })
}