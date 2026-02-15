"use client";

import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { parseSupabaseError, getErrorMessage } from '@/app/lib/errors/error-handler';
import { getUserProfile, UserProfile, clearUserProfileCache, updateUserProfileCache } from '@/app/lib/services/user-service';
import { logger } from '@/app/lib/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Lazy-load Supabase client only in browser to prevent build-time errors
  // If env vars are missing, gracefully run in guest-only mode (no auth)
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      return null as any;
    }
    try {
      return createClient();
    } catch {
      // Supabase env vars missing — run without auth
      return null;
    }
  }, []);

  useEffect(() => {
    // Only run in browser - skip during SSR/build
    if (!supabase || typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let refreshTimer: NodeJS.Timeout | null = null;
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Set up session refresh if session exists
      if (session) {
        scheduleSessionRefresh(session);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clear existing refresh timer
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      
      // Schedule refresh for new session
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        scheduleSessionRefresh(session);
      }
    });

    // Schedule session refresh before expiration
    function scheduleSessionRefresh(session: Session) {
      if (!session.expires_at) return;
      
      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // Refresh 5 minutes before expiration (or immediately if less than 5 min remaining)
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60000); // At least 1 minute
      
      refreshTimer = setTimeout(async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();
          if (error) {
            logger.error('Session refresh failed:', error);
            // If refresh fails, user will be logged out on next request
          } else if (data.session) {
            // Schedule next refresh
            scheduleSessionRefresh(data.session);
          }
        } catch (error) {
          logger.error('Error refreshing session:', error);
        }
      }, refreshTime);
    }

    return () => {
      subscription.unsubscribe();
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [supabase]);

  // Track fetch state with ref to persist across renders (prevents duplicate calls)
  const isFetchingRef = useRef(false);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  // Fetch user profile when user changes (ONCE per user session)
  // CRITICAL: Only fetch if user is logged in
  useEffect(() => {
    let isMounted = true;
    
    async function loadUserProfile() {
      // CRITICAL: Only proceed if user exists and loading is complete
      if (!user || loading) {
        if (!user && isMounted) {
          // Clear profile when user logs out
          setUserProfile(null);
          clearUserProfileCache();
          lastFetchedUserIdRef.current = null;
        }
        return;
      }

      // Prevent duplicate fetches for the same user
      if (isFetchingRef.current || lastFetchedUserIdRef.current === user.id) {
        return;
      }

      // Note: We don't check userProfile state here because getUserProfile
      // handles caching internally. Checking state could cause stale data issues.

      isFetchingRef.current = true;
      lastFetchedUserIdRef.current = user.id;

      try {
        // Pass userId directly to avoid getSession() call
        // getUserProfile handles caching and deduplication internally
        const profile = await getUserProfile(user.id);
        if (isMounted) {
          setUserProfile(profile);
          // Cache is already updated by getUserProfile internally
        }
      } catch (error) {
        logger.error('Error loading user profile:', error);
        if (isMounted) {
          setUserProfile(null);
        }
      } finally {
        isFetchingRef.current = false;
      }
    }

    loadUserProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, loading]); // Use user.id instead of user object to prevent unnecessary re-runs

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not initialized') };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const appError = parseSupabaseError(error);
        return { error: new Error(appError.userMessage) };
      }
      router.refresh();
      return { error: null };
    } catch (error) {
      const appError = parseSupabaseError(error);
      return { error: new Error(appError.userMessage) };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not initialized') };
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });
      if (error) {
        const appError = parseSupabaseError(error);
        return { error: new Error(appError.userMessage) };
      }
      return { error: null };
    } catch (error) {
      const appError = parseSupabaseError(error);
      return { error: new Error(appError.userMessage) };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearUserProfileCache(); // Clear cache on logout
    setUserProfile(null); // Clear profile from state
    router.refresh();
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    try {
      // Validate redirect URL to prevent OAuth token hijacking
      const { getOAuthRedirectURL } = await import('@/app/lib/utils/oauth-redirect');
      const redirectTo = getOAuthRedirectURL('/auth/callback');
      
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
    } catch (error) {
      logger.error('OAuth redirect validation failed:', error);
      const appError = parseSupabaseError(error);
      throw new Error(appError.userMessage || 'Failed to initiate OAuth login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        isAdmin: userProfile?.role === 'admin' || false,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
