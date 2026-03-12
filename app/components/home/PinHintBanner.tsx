'use client';

import React, { useState, useEffect } from 'react';
import { Pin, X, Home } from 'lucide-react';
import Link from 'next/link';

const DISMISSED_KEY = 'onetool-pin-hint-dismissed';

export function PinHintBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (!dismissed) setVisible(true);
    } catch { /* ignore */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-sm">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex-shrink-0">
        <Pin size={14} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <p className="flex-1 text-indigo-700 dark:text-indigo-300 text-xs">
        <strong>Tip:</strong> Click the{' '}
        <Pin size={11} className="inline text-indigo-500" />{' '}
        pin icon on any tool to add it to your{' '}
        <Link href="/" className="font-semibold underline underline-offset-2 hover:text-indigo-900 dark:hover:text-indigo-100">
          My Home
        </Link>
        {' '}for quick access.
      </p>
      <button
        onClick={dismiss}
        className="p-1 rounded-md text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
