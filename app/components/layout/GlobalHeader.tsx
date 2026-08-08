'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search, X, Home, LayoutGrid, ArrowLeft,
} from 'lucide-react';
import { fuzzySearch } from '@/app/lib/search-utils';
import { trackSearch } from '@/app/lib/telemetry';
import { ALL_TOOLS, type ToolHelpConfig } from '@/app/lib/tools-data';
import { ToolHelpPanel } from '@/app/components/tools/shared/ToolHelpPanel';
import {
  loadThemeSettings, applyAllTheme,
  type ThemeSettings,
} from '@/app/components/ui/AccentColorPicker';

// ── Brand color ───────────────────────────────────────────────────────────────
const NAV_BG   = '#1e1b4b';  // deep indigo — app theme
const NAV_TEXT = '#ffffff';

// ── Tool search index ─────────────────────────────────────────────────────────
const SEARCH_TOOLS = ALL_TOOLS.map(tool => ({
  id: tool.id,
  title: tool.name,
  category: tool.category.toLowerCase(),
}));

// ── Page help configs ─────────────────────────────────────────────────────────
const PAGE_HELP_CONFIGS: Record<string, ToolHelpConfig> = {
  '/home': {
    title: 'All Tools',
    description: 'Browse 150+ free tools across Personal Finance, Business OS, Developer, Health, Documents, and more — all running locally in your browser with no account required.',
    steps: [
      { title: 'Browse by category', description: 'Use the category strip to jump to a specific group.' },
      { title: 'Search for a tool', description: 'Use the search bar (⌘K) to instantly find any tool by name or keyword.' },
      { title: 'Pin your favourites', description: 'Click the pin icon on any tool card to pin it. Pinned tools appear on My Home for quick access.' },
      { title: 'Open a tool', description: 'Click any tool card to open it. All data is saved locally — your work persists between sessions.' },
    ],
    tips: [
      { text: 'Pinned tools are stored in your browser — they stay even after you close the tab.' },
      { text: 'Personal Finance tools share one data store — upload once and every analytics tool updates automatically.' },
      { text: 'Business OS tools share one store too — add a party once and it appears in Daybook, Invoices, and Reports.' },
    ],
  },
  '/my-home': {
    title: 'My Home',
    description: 'Your personal dashboard — pin tools for quick access and create custom Spaces to group tools by context.',
    steps: [
      { title: 'Pin tools from the catalog', description: 'Go to All Tools (/home) and click the pin icon on any tool card to add it here.' },
      { title: 'Create custom Spaces', description: 'Click "+ New Space" to create a named workspace and pin tools to it.' },
      { title: 'Switch between Spaces', description: 'Click any Space tab at the top to switch contexts.' },
    ],
    tips: [
      { text: 'Pins are saved in localStorage — they persist across sessions but are device-specific.' },
      { text: 'Use My Home as your daily starting point if you regularly use the same set of tools.' },
    ],
  },
};

// ── Mobile search overlay ─────────────────────────────────────────────────────
function MobileSearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_TOOLS>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.length > 0) setSuggestions(fuzzySearch(SEARCH_TOOLS, query).slice(0, 8));
    else setSuggestions([]);
  }, [query]);

  const handleSelect = (tool: typeof SEARCH_TOOLS[0]) => {
    router.push(`/tools/${tool.category}/${tool.id}`);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = query.trim().replace(/[<>"']/g, '');
      trackSearch(q, suggestions.length);
      router.push(`/home?search=${encodeURIComponent(q)}`);
      onClose();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#151827] shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-white/[0.07]">
          <Search size={15} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search 150+ tools..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={18} />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.05]">
            {suggestions.map(tool => (
              <button
                key={tool.id}
                onClick={() => handleSelect(tool)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{tool.title}</span>
                <span className="text-[10px] text-slate-400 capitalize bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded font-medium ml-2 flex-shrink-0">
                  {tool.category}
                </span>
              </button>
            ))}
          </div>
        )}
        {query.length > 0 && suggestions.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main header content ───────────────────────────────────────────────────────
function HeaderContent() {
  const pathname  = usePathname();
  const router    = useRouter();

  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_TOOLS>([]);
  const [isFocused, setIsFocused]     = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef      = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // ── Apply accent theme (but navbar bg/text are now hardcoded) ─────────────
  useEffect(() => {
    const s = loadThemeSettings();
    applyAllTheme(s);
    const handler = (e: Event) => {
      applyAllTheme((e as CustomEvent<ThemeSettings>).detail);
    };
    window.addEventListener('ot-theme-change', handler);
    return () => window.removeEventListener('ot-theme-change', handler);
  }, []);

  // ── Keyboard shortcut ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) setShowMobileSearch(true);
        else { searchInputRef.current?.focus(); setIsFocused(true); }
      }
      if (e.key === 'Escape') { setIsFocused(false); setQuery(''); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Click outside ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search suggestions ─────────────────────────────────────────────────────
  useEffect(() => {
    if (query.length > 0) setSuggestions(fuzzySearch(SEARCH_TOOLS, query).slice(0, 6));
    else setSuggestions([]);
  }, [query]);

  // ── Page / tool context ────────────────────────────────────────────────────
  const pathSegments  = pathname.split('/').filter(Boolean);
  const category      = pathSegments[1];
  const toolId        = pathSegments[2];
  const currentTool   = toolId ? ALL_TOOLS.find(t => t.id === toolId) : undefined;
  const toolName      = currentTool?.name ?? (toolId ? toolId.replace(/-/g, ' ') : undefined);
  const isOnToolPage  = pathname?.startsWith('/tools/');
  const isMyHome      = pathname === '/' || pathname === '/my-home';
  const isCatalog     = pathname === '/home';

  const toolHelpConfig: ToolHelpConfig | undefined =
    PAGE_HELP_CONFIGS[pathname] ??
    (currentTool
      ? (currentTool.helpConfig ?? { title: currentTool.name, description: currentTool.desc, steps: [] })
      : undefined);

  const handleBack = () => {
    if (toolId && category) router.push(`/home?category=${encodeURIComponent(category)}`);
    else if (pathSegments.length > 0) router.push('/');
    else router.back();
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = query.trim().replace(/[<>"']/g, '');
      trackSearch(q, suggestions.length);
      router.push(`/home?search=${encodeURIComponent(q)}`);
      setIsFocused(false);
    }
  };

  const clearSearch = () => { setQuery(''); setSuggestions([]); searchInputRef.current?.focus(); };

  const handleSuggestionClick = (tool: typeof SEARCH_TOOLS[0]) => {
    router.push(`/tools/${tool.category}/${tool.id}`);
    setQuery(''); setIsFocused(false);
  };

  // ── Nav item classes ───────────────────────────────────────────────────────
  const navItem = (active: boolean) => `
    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold
    transition-colors duration-150 whitespace-nowrap
    ${active
      ? 'bg-white/15 text-white'
      : 'text-white/70 hover:text-white hover:bg-white/10'
    }
  `;

  return (
    <>
      {showMobileSearch && <MobileSearchOverlay onClose={() => setShowMobileSearch(false)} />}

      <header
        className="h-14 relative flex items-center px-4 md:px-6 border-b border-white/10 shrink-0 w-full"
        style={{ backgroundColor: NAV_BG }}
      >

        {/* ── LEFT: Logo + breadcrumb ───────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="OneTool home">
            {/* OT monogram badge */}
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-black text-white tracking-tight leading-none select-none">OT</span>
            </div>
            <span className="text-[15px] font-bold tracking-tight select-none text-white">
              OneTool
            </span>
          </Link>

          {/* Breadcrumb — only on tool pages */}
          {isOnToolPage && (
            <div className="flex items-center gap-1 text-sm ml-1">
              <span className="text-white/20">|</span>
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10"
                aria-label="Go back"
              >
                <ArrowLeft size={14} />
              </button>
              {category && (
                <>
                  <span className="text-white/20">/</span>
                  <Link
                    href={`/home?category=${category}`}
                    className="capitalize text-[11px] font-medium transition-colors text-white/60 hover:text-white"
                  >{category}</Link>
                </>
              )}
              {toolName && (
                <>
                  <span className="text-white/20">/</span>
                  <span className="font-semibold capitalize truncate max-w-[160px] text-[11px] text-white">
                    {toolName}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── CENTER: Search bar ────────────────────────────────────────── */}
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-2 hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: isFocused ? '#a5b4fc' : 'rgba(255,255,255,0.45)' }}
            />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search 150+ tools..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleSearchEnter}
              aria-label="Search tools"
              aria-autocomplete="list"
              aria-controls={isFocused && suggestions.length > 0 ? 'search-suggestions' : undefined}
              aria-expanded={isFocused && suggestions.length > 0}
              className="w-full h-9 rounded-lg py-0 pl-9 pr-20 text-[13px] border focus:outline-none transition-all text-white placeholder:text-white/45"
              style={{
                backgroundColor: isFocused ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.10)',
                borderColor: isFocused ? 'rgba(165,180,252,0.5)' : 'rgba(255,255,255,0.12)',
                boxShadow: isFocused ? '0 0 0 3px rgba(165,180,252,0.15)' : 'none',
              }}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query ? (
                <button onClick={clearSearch} className="p-1 text-white/50 hover:text-white transition-colors" aria-label="Clear search">
                  <X size={13} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-white/40 bg-white/10 border border-white/10">
                  <span className="text-[9px]">⌘</span>K
                </kbd>
              )}
            </div>
          </div>

          {/* Search suggestions dropdown */}
          {isFocused && query && suggestions.length > 0 && (
            <div id="search-suggestions" role="listbox" aria-label="Search suggestions" className="absolute top-full mt-1.5 w-full bg-white dark:bg-[#1A1D2E] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/[0.05]">
                Results
              </div>
              {suggestions.map(tool => (
                <button
                  key={tool.id}
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSuggestionClick(tool)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between group transition-colors"
                >
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-[var(--ot-accent,#6366f1)] transition-colors">{tool.title}</span>
                  <span className="text-[10px] text-slate-400 capitalize bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded font-medium ml-2 flex-shrink-0">{tool.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Nav links + mobile search ──────────────────────────── */}
        <div className="flex items-center gap-1 ml-auto z-10">

          {/* Mobile search trigger */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-2 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          {/* My Home */}
          <Link href="/" className={navItem(isMyHome)} title="My Home">
            <Home size={14} />
            <span className="hidden sm:inline">My Home</span>
          </Link>

          {/* All Tools */}
          <Link href="/home" className={navItem(isCatalog)} title="All Tools">
            <LayoutGrid size={14} />
            <span className="hidden sm:inline">All Tools</span>
          </Link>

          {/* Tool help */}
          {toolHelpConfig && (
            <div className="hidden sm:block">
              <ToolHelpPanel config={toolHelpConfig} />
            </div>
          )}

        </div>
      </header>
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function GlobalHeader() {
  return (
    <Suspense fallback={
      <div className="h-14 border-b border-white/10 shrink-0 flex items-center gap-2.5 px-4 md:px-6" style={{ backgroundColor: NAV_BG }}>
        <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center">
          <span className="text-[13px] font-black text-white tracking-tight leading-none">OT</span>
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">OneTool</span>
      </div>
    }>
      <HeaderContent />
    </Suspense>
  );
}
