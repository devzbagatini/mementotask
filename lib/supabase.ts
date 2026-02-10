import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-project-url' || supabaseAnonKey === 'your-anon-key') {
  console.warn('Supabase not configured. Using localStorage fallback.');
}

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-project-url')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
