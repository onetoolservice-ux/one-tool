"use client";

import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <UserPlus className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Sign Up</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Authentication is currently disabled.</p>
      <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Go Home
      </button>
    </div>
  );
}
