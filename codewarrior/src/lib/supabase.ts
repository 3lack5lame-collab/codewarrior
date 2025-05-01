import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anonymous Key. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
