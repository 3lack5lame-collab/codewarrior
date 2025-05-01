import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, AuthUser } from '../services/AuthService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGitHub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (profile: { username?: string; avatarUrl?: string }) => Promise<{ success: boolean; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const authService = new AuthService();

  useEffect(() => {
    // Try to restore session and get current user
    const initializeAuth = async () => {
      try {
        const sessionRestored = await authService.restoreSession();
        
        if (sessionRestored) {
          const { user: currentUser } = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: newUser, error } = await authService.signUp(email, password);
      
      if (!error) {
        setUser(newUser);
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: signedInUser, error } = await authService.signIn(email, password);
      
      if (!error) {
        setUser(signedInUser);
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signInWithGitHub();
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signOut();
      
      if (!error) {
        setUser(null);
      }
      
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile: { username?: string; avatarUrl?: string }) => {
    setLoading(true);
    try {
      const result = await authService.updateProfile(profile);
      
      if (result.success && user) {
        // Update local user state with new profile data
        setUser({
          ...user,
          ...(profile.username && { username: profile.username }),
          ...(profile.avatarUrl && { avatarUrl: profile.avatarUrl }),
        });
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithGitHub,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
