import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Course {
  id: string
  title: string
  university: string
  duration: string
  location: string
  fees: number
  description: string
  instructor: string
  category: string
  level: string
  image_url: string
  created_at: string
  updated_at: string
}