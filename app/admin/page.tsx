"use client";

import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <Shield className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Admin Panel</h1>
      <p className="text-gray-500 dark:text-gray-400">Admin features are currently disabled.</p>
    </div>
  );
}
