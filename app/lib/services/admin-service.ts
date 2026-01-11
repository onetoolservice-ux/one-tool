/**
 * Admin Service
 * 
 * Service layer for admin operations (user management, tool management)
 * Only accessible to users with admin role
 */

import { createClient } from '@/app/lib/supabase/client';
import { parseSupabaseError, ErrorCode, createError } from '../errors/error-handler';
import { isAdmin as checkIsAdmin } from './user-service';

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

export interface AdminStats {
  totalUsers: number;
  totalTools: number;
  totalAdmins: number;
  recentUsers: UserProfile[];
}

/**
 * Check if current user is admin
 * 
 * ⚠️ DEPRECATED: Use AuthContext.isAdmin instead
 * This function is kept for backward compatibility but uses cached user profile
 */
export async function isAdmin(): Promise<boolean> {
  return checkIsAdmin();
}

/**
 * Get admin statistics
 * BATCHED: Combines multiple queries to reduce requests
 */
export async function getAdminStats(): Promise<{ data: AdminStats | null; error: string | null }> {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck) {
      return {
        data: null,
        error: 'Unauthorized: Admin access required',
      };
    }

    const supabase = createClient();

    // BATCH: Run all queries in parallel to reduce total time
    const [
      { count: totalUsers },
      { count: totalAdmins },
      { count: totalTools },
      { data: recentUsers }
    ] = await Promise.all([
      // Get total users
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      // Get total admins
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin'),
      // Get total tools
      supabase
        .from('tools')
        .select('*', { count: 'exact', head: true }),
      // Get recent users (last 10)
      supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return {
      data: {
        totalUsers: totalUsers || 0,
        totalTools: totalTools || 0,
        totalAdmins: totalAdmins || 0,
        recentUsers: (recentUsers as UserProfile[]) || [],
      },
      error: null,
    };
  } catch (error) {
    const appError = parseSupabaseError(error);
    return {
      data: null,
      error: appError.userMessage,
    };
  }
}

/**
 * Get all users (paginated)
 */
export async function getAllUsers(page = 1, pageSize = 20): Promise<{
  data: UserProfile[] | null;
  total: number;
  error: string | null;
}> {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck) {
      return {
        data: null,
        total: 0,
        error: 'Unauthorized: Admin access required',
      };
    }

    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // BATCH: Get count and data in parallel
    const [{ count }, { data, error }] = await Promise.all([
      // Get total count
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      // Get paginated users
      supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)
    ]);

    if (error) {
      const appError = parseSupabaseError(error);
      return {
        data: null,
        total: 0,
        error: appError.userMessage,
      };
    }

    return {
      data: (data as UserProfile[]) || [],
      total: count || 0,
      error: null,
    };
  } catch (error) {
    const appError = parseSupabaseError(error);
    return {
      data: null,
      total: 0,
      error: appError.userMessage,
    };
  }
}

/**
 * Update user (admin only)
 * Note: Role changes must be done via SQL for security
 */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url' | 'preferences'>>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      };
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      const appError = parseSupabaseError(error);
      return {
        success: false,
        error: appError.userMessage,
      };
    }

    return { success: true, error: null };
  } catch (error) {
    const appError = parseSupabaseError(error);
    return {
      success: false,
      error: appError.userMessage,
    };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck) {
      return {
        success: false,
        error: 'Unauthorized: Admin access required',
      };
    }

    // Prevent deleting own account
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id === userId) {
      return {
        success: false,
        error: 'You cannot delete your own account',
      };
    }

    // Delete user profile (cascade will handle auth.users deletion)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      const appError = parseSupabaseError(error);
      return {
        success: false,
        error: appError.userMessage,
      };
    }

    return { success: true, error: null };
  } catch (error) {
    const appError = parseSupabaseError(error);
    return {
      success: false,
      error: appError.userMessage,
    };
  }
}

/**
 * Search users
 */
export async function searchUsers(query: string): Promise<{
  data: UserProfile[] | null;
  error: string | null;
}> {
  try {
    const adminCheck = await checkIsAdmin();
    if (!adminCheck) {
      return {
        data: null,
        error: 'Unauthorized: Admin access required',
      };
    }

    // Sanitize and validate search query to prevent SQL injection
    // Only allow alphanumeric characters, spaces, @, ., -, and _ (for emails and names)
    const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9\s@.\-_]/g, '');
    
    // Enforce length limit
    if (sanitizedQuery.length > 100) {
      return {
        data: null,
        error: 'Search query too long (max 100 characters)',
      };
    }
    
    if (sanitizedQuery.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    // Escape special characters for Supabase ilike pattern
    // Replace % and _ with escaped versions, then wrap in % for pattern matching
    const escapedQuery = sanitizedQuery.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const pattern = `%${escapedQuery}%`;

    const supabase = createClient();
    // Use Supabase's filter methods which handle escaping automatically
    // The .or() method expects: "column.operator.value,column2.operator.value"
    // Values are automatically escaped by Supabase when using the query builder
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`email.ilike.${pattern},full_name.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      const appError = parseSupabaseError(error);
      return {
        data: null,
        error: appError.userMessage,
      };
    }

    return {
      data: (data as UserProfile[]) || [],
      error: null,
    };
  } catch (error) {
    const appError = parseSupabaseError(error);
    return {
      data: null,
      error: appError.userMessage,
    };
  }
}
