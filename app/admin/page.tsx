"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/auth-context';
import { getAdminStats, getAllUsers, UserProfile, AdminStats, searchUsers, deleteUser } from '@/app/lib/services/admin-service';
import { showToast } from '@/app/shared/Toast';
import { Shield, Users, Package, UserCheck, Search, Trash2, Mail, Calendar, Crown, Loader2, AlertCircle } from 'lucide-react';

// Force dynamic rendering to prevent prerendering during build
// This avoids errors when Supabase env vars are missing during build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin: isUserAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if (!isUserAdmin) {
        showToast('Access denied: Admin privileges required', 'error');
        router.push('/');
      }
    }
  }, [user, authLoading, isUserAdmin, router]);

  useEffect(() => {
    if (isUserAdmin) {
      loadStats();
      loadUsers();
    }
  }, [isUserAdmin, usersPage]);

  const loadStats = async () => {
    const { data, error } = await getAdminStats();
    if (error) {
      showToast(error, 'error');
    } else if (data) {
      setStats(data);
    }
  };

  const loadUsers = async () => {
    const { data, total, error } = await getAllUsers(usersPage, 20);
    if (error) {
      showToast(error, 'error');
    } else if (data) {
      setUsers(data);
      setUsersTotal(total);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const { data, error } = await searchUsers(query);
      if (error) {
        showToast(error, 'error');
      } else if (data) {
        setUsers(data);
        setUsersTotal(data.length);
      }
    } else {
      loadUsers();
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string | null) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail || userId}? This action cannot be undone.`)) {
      return;
    }

    setDeletingUserId(userId);
    const { success, error } = await deleteUser(userId);
    setDeletingUserId(null);

    if (error) {
      showToast(error, 'error');
    } else if (success) {
      showToast('User deleted successfully', 'success');
      loadUsers();
      loadStats();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage users, tools, and system settings</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalUsers}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalTools}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Tools</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Crown size={24} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stats.totalAdmins}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Administrators</p>
            </div>
          </div>
        )}

        {/* Users Management */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck size={20} />
                User Management
              </h2>
              <div className="flex-1 max-w-md ml-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users by email or name..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                            {userItem.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {userItem.full_name || 'No name'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Mail size={12} />
                              {userItem.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          userItem.role === 'admin'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {userItem.role === 'admin' && <Crown size={12} />}
                          {userItem.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(userItem.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {userItem.user_id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(userItem.user_id, userItem.email)}
                            disabled={deletingUserId === userItem.user_id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                          >
                            {deletingUserId === userItem.user_id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!searchQuery && usersTotal > 20 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {(usersPage - 1) * 20 + 1} to {Math.min(usersPage * 20, usersTotal)} of {usersTotal} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                  disabled={usersPage === 1}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setUsersPage(p => p + 1)}
                  disabled={usersPage * 20 >= usersTotal}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-bold mb-1">Admin Actions</p>
              <p className="text-blue-700 dark:text-blue-400">
                To change a user's role (including making them admin), use the SQL Editor in Supabase Dashboard. 
                Users cannot change their own roles for security reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
