// Get these from Supabase Dashboard → Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
import { createClient } from '@supabase/supabase-js'

let supabase: any = null

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client initialized:', { url: supabaseUrl, keyLength: supabaseAnonKey.length })
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
  }
} else {
  console.warn('⚠️ Supabase credentials not configured.')
  console.warn('Current values:', {
    url: supabaseUrl === 'YOUR_SUPABASE_URL' ? 'NOT SET' : supabaseUrl.substring(0, 30) + '...',
    key: supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' ? 'NOT SET' : supabaseAnonKey.substring(0, 20) + '...'
  })
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file')
}

export { supabase }

// Storage bucket names
export const STORAGE_BUCKETS = {
  VENDOR_IMAGES: 'vendor-images',
  LISTING_IMAGES: 'listing-images',
  USER_UPLOADS: 'user-uploads',
} as const
