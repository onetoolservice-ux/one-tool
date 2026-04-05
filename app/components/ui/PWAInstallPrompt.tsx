'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'ot-pwa-prompt-dismissed';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed (permanent) or installed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
    const isStandalone = (window.navigator as any).standalone === true;
    if (isStandalone) return; // already installed

    if (ios) {
      setIsIOS(true);
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => setVisible(true), 30000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
          <Smartphone size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Add OneTool to Home Screen</p>
          {isIOS ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span> for instant access — offline too.
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Install for faster access, works offline, and no browser chrome.
            </p>
          )}
          {!isIOS && (
            <button
              onClick={install}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <Download size={12} /> Install App
            </button>
          )}
        </div>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
