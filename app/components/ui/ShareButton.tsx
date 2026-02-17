'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link2, Check, X } from 'lucide-react';
import { trackShare } from '@/app/lib/telemetry';

export function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleClick = async () => {
    const url = window.location.href;
    const title = document.title;

    // Try native Web Share API first (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        trackShare(url, 'native');
      } catch { /* user cancelled */ }
      return;
    }

    // Desktop: show dropdown
    setIsOpen(prev => !prev);
  };

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackShare(url, 'copy');
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard denied */ }
  };

  const currentUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const pageTitle = typeof document !== 'undefined' ? encodeURIComponent(document.title) : '';

  const shareLinks = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${pageTitle}%20${currentUrl}`,
      color: 'text-green-600',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
    },
    {
      name: 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${pageTitle}`,
      color: 'text-sky-500',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleClick}
        className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Share"
      >
        <Share2 size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 pt-3 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share</span>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10">
              <X size={12} className="text-gray-400" />
            </button>
          </div>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Link2 size={16} className="text-gray-500" />}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {copied ? 'Copied!' : 'Copy link'}
            </span>
          </button>

          <div className="h-px bg-gray-100 dark:bg-white/5 mx-3" />

          {/* Social links */}
          {shareLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackShare(window.location.href, link.name.toLowerCase());
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <span className={link.color}>{link.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{link.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
