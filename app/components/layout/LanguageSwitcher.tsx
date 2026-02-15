'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  return (
    <button
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Switch language"
    >
      <Globe size={18} />
    </button>
  );
}
