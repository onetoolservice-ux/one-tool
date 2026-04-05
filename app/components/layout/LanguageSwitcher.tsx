'use client';

import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ navText }: { navText?: string | null }) {
  return (
    <button
      disabled
      title="Multi-language support coming soon"
      className={`p-2 rounded-lg transition-colors opacity-40 cursor-not-allowed ${navText ? '' : 'text-slate-400'}`}
      style={navText ? { color: navText } : undefined}
      aria-label="Language switcher — coming soon"
    >
      <Globe size={17} />
    </button>
  );
}
