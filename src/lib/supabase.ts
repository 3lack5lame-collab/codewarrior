import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize Supabase client
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
