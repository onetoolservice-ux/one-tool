'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Coffee, Home, X, LayoutDashboard } from 'lucide-react';
import { ShareButton } from '@/app/components/ui/ShareButton';
import { ThemeToggle } from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLogo from '@/app/components/BrandLogo';
import { fuzzySearch } from '@/app/lib/search-utils';
import { trackSearch } from '@/app/lib/telemetry';
import { ALL_TOOLS } from '@/app/lib/tools-data';

const SEARCH_TOOLS = ALL_TOOLS.map(tool => ({
  id: tool.id,
  title: tool.name,
  category: tool.category.toLowerCase(),
}));

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_TOOLS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Keyboard shortcut: Ctrl/Cmd+K focuses the global search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pathSegments = pathname.split('/').filter(Boolean);
  const category = pathSegments[1];
  const toolName = pathSegments[2]?.replace(/-/g, ' ');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setSuggestions(fuzzySearch(SEARCH_TOOLS, query).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const sanitizedQuery = query.trim().replace(/[<>"']/g, '');
      trackSearch(sanitizedQuery, suggestions.length);
      router.push(`/?search=${encodeURIComponent(sanitizedQuery)}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (tool: typeof SEARCH_TOOLS[0]) => {
    router.push(`/tools/${tool.category}/${tool.id}`);
    setQuery('');
    setIsFocused(false);
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]">
      {/* Left: Logo / Breadcrumb */}
      <div className="flex items-center gap-3 mr-6 min-w-fit">
        {isHome ? (
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo size={32} />
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              One<span className="text-indigo-500">Tool</span>
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/" className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <Home size={16} />
            </Link>
            {category && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <Link href={`/?category=${category}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white capitalize transition-colors text-xs font-medium">{category}</Link>
              </>
            )}
            {toolName && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize truncate max-w-[180px] text-xs">{toolName}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-lg hidden md:block relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleSearchEnter}
            className="w-full rounded-lg py-1.5 pl-9 pr-20 text-sm bg-slate-100/80 dark:bg-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-white/[0.08] focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query ? (
              <button
                onClick={() => { setQuery(''); router.push('/'); }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300/40 dark:border-white/[0.06]">
                <span className="text-[9px]">⌘</span>K
              </kbd>
            )}
          </div>
        </div>

        {isFocused && query && suggestions.length > 0 && (
          <div className="absolute top-full mt-1.5 w-full bg-white dark:bg-[#1A1D2E] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden z-50">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Results
            </div>
            {suggestions.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleSuggestionClick(tool)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group transition-colors"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tool.title}</span>
                <span className="text-[10px] text-slate-400 capitalize bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded font-medium">{tool.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <ShareButton />

        <Link
          href="/workspace"
          className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="My Workspace"
        >
          <LayoutDashboard size={17} />
        </Link>

        <a
          href="https://buymeacoffee.com/onetool"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Buy me a coffee"
        >
          <Coffee size={17} />
        </a>
      </div>
    </header>
  );
}

export default function GlobalHeader() {
  return (
    <Suspense fallback={<div className="h-14 bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/[0.06]" />}>
      <HeaderContent />
    </Suspense>
  );
}
