import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

// Key for storing the session in SecureStore
const SUPABASE_SESSION_KEY = 'supabase-session';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const user = data.user ? {
        id: data.user.id,
        email: data.user.email || '',
      } : null;

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const user = data.user ? {
        id: data.user.id,
        email: data.user.email || '',
      } : null;

      // Store session in secure storage
      if (data.session) {
        await this.saveSession(data.session);
      }

      return { user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign in with GitHub OAuth
   */
  async signInWithGitHub(): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
      });

      if (error) {
        throw error;
      }

      // Note: The actual user data will be available after the OAuth flow completes
      // and the user is redirected back to the app
      return { user: null, error: null };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Clear stored session
      await SecureStore.deleteItemAsync(SUPABASE_SESSION_KEY);
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }

      if (!data.user) {
        return { user: null, error: null };
      }

      // Get additional profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', data.user.id)
        .single();

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        username: profileData?.username,
        avatarUrl: profileData?.avatar_url,
      };

      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error: error as Error };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: { username?: string; avatarUrl?: string }): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      if (!userData.user) {
        throw new Error('No user logged in');
      }

      const updates = {
        id: userData.user.id,
        ...(profile.username && { username: profile.username }),
        ...(profile.avatarUrl && { avatar_url: profile.avatarUrl }),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Save session to secure storage
   */
  private async saveSession(session: any): Promise<void> {
    await SecureStore.setItemAsync(
      SUPABASE_SESSION_KEY,
      JSON.stringify(session)
    );
  }

  /**
   * Restore session from secure storage
   */
  async restoreSession(): Promise<boolean> {
    try {
      const sessionString = await SecureStore.getItemAsync(SUPABASE_SESSION_KEY);
      
      if (!sessionString) {
        return false;
      }

      const session = JSON.parse(sessionString);
      const { error } = await supabase.auth.setSession(session);
      
      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Restore session error:', error);
      return false;
    }
  }
}
