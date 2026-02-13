
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


const isValidUrl = (url: string | undefined): boolean => {
  try {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey;

// Create a dummy client or real one to prevent crash
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : createClient('https://placeholder.supabase.co', 'placeholder'); // Won't work but prevents init crash if handled upstream
