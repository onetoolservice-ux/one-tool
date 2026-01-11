/**
 * User Service
 * 
 * Centralized service for user profile operations
 * Fetches user profile ONCE and caches it
 * Avoids repeated Supabase calls
 */

import { createClient } from '@/app/lib/supabase/client';
import { logger } from '@/app/lib/utils/logger';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// In-memory cache for user profile (cleared on logout)
let userProfileCache: {
  userId: string;
  profile: UserProfile | null;
  timestamp: number;
} | null = null;

// Track ongoing fetch to prevent duplicate simultaneous requests
let ongoingFetch: Promise<UserProfile | null> | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get current user's profile (with caching)
 * Fetches once, then uses cache
 * Prevents duplicate simultaneous requests
 * ONLY fetches if user is logged in
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  try {
    const supabase = createClient();
    
    // If userId provided, use it directly (avoids getSession() call)
    // Otherwise, get from session (faster than getUser())
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id;
    }
    
    // CRITICAL: Only proceed if user is logged in
    // Return null immediately if no user - don't make any database calls
    if (!targetUserId) {
      // Clear cache if user logged out
      if (userProfileCache) {
        userProfileCache = null;
        ongoingFetch = null;
      }
      return null;
    }

    // Check cache FIRST (before any async calls)
    if (userProfileCache && 
        userProfileCache.userId === targetUserId &&
        Date.now() - userProfileCache.timestamp < CACHE_TTL) {
      return userProfileCache.profile;
    }

    // If there's already an ongoing fetch for this user, return that promise
    // This prevents duplicate simultaneous requests
    if (ongoingFetch) {
      return ongoingFetch;
    }

    // Start new fetch
    ongoingFetch = (async () => {
      try {
        // Fetch from database
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', targetUserId!)
          .single();

        if (error) {
          logger.error('Error fetching user profile:', error);
          return null;
        }

        // Update cache
        userProfileCache = {
          userId: targetUserId!,
          profile: data as UserProfile,
          timestamp: Date.now(),
        };

        return data as UserProfile;
      } finally {
        // Clear ongoing fetch flag
        ongoingFetch = null;
      }
    })();

    return ongoingFetch;
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    ongoingFetch = null;
    return null;
  }
}

/**
 * Check if current user is admin (uses cached profile)
 * Only checks if user is logged in
 */
export async function isAdmin(): Promise<boolean> {
  // First check if user is logged in before making any calls
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    return false; // No user logged in
  }
  
  const profile = await getUserProfile(session.user.id);
  return profile?.role === 'admin';
}

/**
 * Get user role (uses cached profile)
 * Only checks if user is logged in
 */
export async function getUserRole(): Promise<'user' | 'admin' | null> {
  // First check if user is logged in before making any calls
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user?.id) {
    return null; // No user logged in
  }
  
  const profile = await getUserProfile(session.user.id);
  return profile?.role || null;
}

/**
 * Clear user profile cache (call on logout)
 */
export function clearUserProfileCache(): void {
  userProfileCache = null;
  ongoingFetch = null; // Also clear any ongoing fetch
}

/**
 * Update user profile cache (call after profile updates)
 */
export function updateUserProfileCache(profile: UserProfile | null): void {
  if (profile) {
    userProfileCache = {
      userId: profile.user_id,
      profile,
      timestamp: Date.now(),
    };
    ongoingFetch = null; // Clear ongoing fetch since we have fresh data
  } else {
    userProfileCache = null;
    ongoingFetch = null;
  }
}
