import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Course interface definition as JSDoc comment for documentation
/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} university
 * @property {string} duration
 * @property {string} location
 * @property {number} fees
 * @property {string} description
 * @property {string} instructor
 * @property {string} category
 * @property {string} level
 * @property {string} image_url
 * @property {string} created_at
 * @property {string} updated_at
 */
