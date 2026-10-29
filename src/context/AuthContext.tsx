import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  isPreviewAdmin?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginAsPreviewAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      // Check if temporary session was saved
      const savedSession = sessionStorage.getItem('estchay_admin_session');
      const savedPreview = sessionStorage.getItem('estchay_preview_admin');

      if (savedSession === 'true' || savedPreview === 'true') {
        setUser({
          id: 'admin-01',
          email: 'admin@estchaybags.com',
          role: 'admin',
          isPreviewAdmin: savedPreview === 'true',
        });
      }
      setLoading(false);
      return;
    }

    // Live Supabase Auth session listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        verifyAdminRole(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        verifyAdminRole(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verifyAdminRole = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data && (data.role === 'admin' || data.role === 'super_admin')) {
        setUser({
          id: userId,
          email,
          role: data.role,
        });
      } else {
        // Not an authorized admin
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (_email: string, password: string) => {
    // Check against the requested boutique password
    const BOUTIQUE_PASSWORD = 'EstherChay2026';

    if (password === BOUTIQUE_PASSWORD) {
      const adminUser: AdminUser = {
        id: 'admin-01',
        email: 'admin@estchaybags.com',
        role: 'admin',
      };
      setUser(adminUser);
      sessionStorage.setItem('estchay_admin_session', 'true');
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid administrator password. Please try again.',
    };
  };

  const signOut = async () => {
    sessionStorage.removeItem('estchay_admin_session');
    sessionStorage.removeItem('estchay_preview_admin');
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Supabase is not configured. Password resets require active Supabase credentials.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Password reset link sent to your administrator email address.',
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send reset link' };
    }
  };

  const loginAsPreviewAdmin = () => {
    sessionStorage.setItem('estchay_preview_admin', 'true');
    setUser({
      id: 'preview-admin-01',
      email: 'owner@estchaybags.com',
      role: 'admin',
      isPreviewAdmin: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: Boolean(user && (user.role === 'admin' || user.role === 'super_admin')),
        signIn,
        signOut,
        resetPassword,
        loginAsPreviewAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
