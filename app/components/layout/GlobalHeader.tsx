'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Search, X, Star, LayoutGrid, ArrowLeft, GraduationCap,
} from 'lucide-react';
import { ShareButton } from '@/app/components/ui/ShareButton';
import BrandLogo from '@/app/components/BrandLogo';
import { fuzzySearch } from '@/app/lib/search-utils';
import { trackSearch } from '@/app/lib/telemetry';
import { ALL_TOOLS, type ToolHelpConfig } from '@/app/lib/tools-data';
import { ToolHelpPanel } from '@/app/components/tools/shared/ToolHelpPanel';
import {
  AccentColorPicker,
  loadThemeSettings, applyAllTheme, resolveNavbarTextColor,
  type ThemeSettings,
} from '@/app/components/ui/AccentColorPicker';

const SEARCH_TOOLS = ALL_TOOLS.map(tool => ({
  id: tool.id,
  title: tool.name,
  category: tool.category.toLowerCase(),
}));

const PAGE_HELP_CONFIGS: Record<string, ToolHelpConfig> = {
  '/home': {
    title: 'All Tools',
    description: 'Browse 150+ free tools across Personal Finance, Business OS, Developer, Health, Documents, and more — all running locally in your browser with no account required.',
    steps: [
      { title: 'Browse by category', description: 'Use the sidebar (desktop) or the category strip (mobile) to jump to a specific group.' },
      { title: 'Search for a tool', description: 'Use the search bar (⌘K) to instantly find any tool by name or keyword.' },
      { title: 'Pin your favourites', description: 'Click the pin icon on any tool card to pin it. Pinned tools appear on your My Home page for quick access.' },
      { title: 'Open a tool', description: 'Click any tool card to open it. All data is saved locally — your work persists between sessions.' },
    ],
    tips: [
      { text: 'Pinned tools are stored in your browser — they stay even after you close the tab.' },
      { text: 'Personal Finance tools share one data store — upload once in Statement Manager and every analytics tool updates automatically.' },
      { text: 'Business OS tools share one store too — add a party once and it appears in Daybook, Invoices, and Reports.' },
    ],
  },
  '/my-home': {
    title: 'My Home',
    description: 'Your personal dashboard — create Spaces to group tools by context (Work, Finance, Health) and quickly access your most-used tools.',
    steps: [
      { title: 'Pin tools from the catalog', description: 'Go to All Tools (/home) and click the pin icon on any tool card to add it here.' },
      { title: 'Create custom Spaces', description: 'Click "+ New Space" to create a named workspace (e.g. Work, Health) and pin tools to it.' },
      { title: 'Switch between Spaces', description: 'Click any Space tab at the top to switch. Each Space has its own independent set of pinned tools.' },
    ],
    tips: [
      { text: 'Pins are saved in localStorage — they persist across sessions but are device-specific.' },
      { text: 'Use My Home as your daily starting point if you regularly use the same set of tools.' },
    ],
  },
};

// ── Mobile search overlay ─────────────────────────────────────────────────────

function MobileSearchOverlay({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_TOOLS>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setSuggestions(fuzzySearch(SEARCH_TOOLS, query).slice(0, 8));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSelect = (tool: typeof SEARCH_TOOLS[0]) => {
    router.push(`/tools/${tool.category}/${tool.id}`);
    onClose();
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-white/[0.07]">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search 150+ tools..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSubmit}
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={18} />
          </button>
        </div>
        {/* Results */}
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

// ── Main header ───────────────────────────────────────────────────────────────

function HeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_TOOLS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // ── Theme: navbar bg + text color ─────────────────────────────────────────
  const [navBg, setNavBg] = useState<string | null>(null);
  const [navText, setNavText] = useState<string | null>(null);

  useEffect(() => {
    const s = loadThemeSettings();
    applyAllTheme(s);
    setNavBg(s.navbar !== 'auto' ? s.navbar : null);
    setNavText(resolveNavbarTextColor(s));

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ThemeSettings>).detail;
      setNavBg(detail.navbar !== 'auto' ? detail.navbar : null);
      setNavText(resolveNavbarTextColor(detail));
    };
    window.addEventListener('ot-theme-change', handler);
    return () => window.removeEventListener('ot-theme-change', handler);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K focuses the global search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // On mobile show the overlay; on desktop focus inline
        if (window.innerWidth < 768) {
          setShowMobileSearch(true);
        } else {
          searchInputRef.current?.focus();
          setIsFocused(true);
        }
      }
      if (e.key === 'Escape') {
        setIsFocused(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pathSegments = pathname.split('/').filter(Boolean);
  const category = pathSegments[1];
  const toolId = pathSegments[2];
  const currentTool = toolId ? ALL_TOOLS.find(t => t.id === toolId) : undefined;
  const toolName = currentTool?.name ?? (toolId ? toolId.replace(/-/g, ' ') : undefined);
  const toolHelpConfig: ToolHelpConfig | undefined =
    PAGE_HELP_CONFIGS[pathname] ??
    (currentTool
      ? (currentTool.helpConfig ?? {
          title: currentTool.name,
          description: currentTool.desc,
          steps: [],
        })
      : undefined);

  // Back navigation — structured (not browser history) to work on direct links
  const handleBack = () => {
    if (toolId && category) {
      // On a tool page — go to the category in the catalog
      router.push(`/home?category=${encodeURIComponent(category)}`);
    } else if (pathSegments.length > 0) {
      router.push('/');
    } else {
      router.back();
    }
  };

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
      router.push(`/home?search=${encodeURIComponent(sanitizedQuery)}`);
      setIsFocused(false);
    }
  };

  const clearSearch = () => {
    // Stay on current page — just clear the query
    setQuery('');
    setSuggestions([]);
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (tool: typeof SEARCH_TOOLS[0]) => {
    router.push(`/tools/${tool.category}/${tool.id}`);
    setQuery('');
    setIsFocused(false);
  };

  const inputStyle: React.CSSProperties = navBg
    ? {
        backgroundColor: isFocused
          ? 'color-mix(in srgb, var(--ot-navbar-text) 18%, transparent)'
          : 'color-mix(in srgb, var(--ot-navbar-text) 10%, transparent)',
        borderColor: isFocused
          ? 'var(--ot-accent)'
          : 'color-mix(in srgb, var(--ot-navbar-text) 22%, transparent)',
        ...(isFocused ? {
          boxShadow: 'inset 0 0 0 1px var(--ot-accent), 0 0 0 3px color-mix(in srgb, var(--ot-accent) 12%, transparent)',
        } : {}),
      }
    : isFocused
    ? {
        borderColor: 'var(--ot-accent)',
        boxShadow: 'inset 0 0 0 1px var(--ot-accent), 0 0 0 3px color-mix(in srgb, var(--ot-accent) 12%, transparent)',
      }
    : {};

  return (
    <>
      {showMobileSearch && (
        <MobileSearchOverlay onClose={() => setShowMobileSearch(false)} />
      )}

      <header
        className={`h-14 flex items-center justify-between px-4 md:px-6 border-b transition-colors ${
          navBg
            ? 'border-white/10'
            : 'bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-xl border-slate-200/60 dark:border-white/[0.06]'
        }`}
        style={{
          ...(navBg ? { backgroundColor: navBg } : {}),
          ...(navText ? { '--ot-navbar-text': navText } as React.CSSProperties : {}),
        }}
        data-custom-nav={navBg ? '1' : undefined}
      >
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-2 mr-4 min-w-fit">
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="OneTool home">
            <BrandLogo size={28} />
            <span
              className={`text-base font-bold tracking-tight hidden sm:block ${navText ? '' : 'text-slate-900 dark:text-white'}`}
              style={navText ? { color: navText } : undefined}
            >
              One<span className="text-[var(--ot-accent,#6366f1)]">Tool</span>
            </span>
          </Link>

          {!isHome && (
            <div className="flex items-center gap-1 text-sm">
              <span className={navText ? 'opacity-20' : 'text-slate-200 dark:text-slate-700'} style={navText ? { color: navText } : undefined}>|</span>
              <button
                onClick={handleBack}
                className={`p-1.5 rounded-lg transition-colors ${navText ? 'hover:opacity-75' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                style={navText ? { color: navText } : undefined}
                aria-label="Go back"
                title="Back"
              >
                <ArrowLeft size={15} />
              </button>
              {category && (
                <>
                  <span className={navText ? 'opacity-30' : 'text-slate-300 dark:text-slate-700'} style={navText ? { color: navText } : undefined}>/</span>
                  <Link
                    href={`/home?category=${category}`}
                    className={`capitalize transition-colors text-xs font-medium ${navText ? 'opacity-70 hover:opacity-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                    style={navText ? { color: navText } : undefined}
                  >{category}</Link>
                </>
              )}
              {toolName && (
                <>
                  <span className={navText ? 'opacity-30' : 'text-slate-300 dark:text-slate-700'} style={navText ? { color: navText } : undefined}>/</span>
                  <span
                    className={`font-semibold capitalize truncate max-w-[140px] text-xs ${navText ? '' : 'text-slate-900 dark:text-white'}`}
                    style={navText ? { color: navText } : undefined}
                  >{toolName}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Center: Search (desktop only) */}
        <div className="flex-1 max-w-lg hidden md:block relative" ref={searchRef}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-colors"
              style={{ color: isFocused ? 'var(--ot-accent)' : undefined }}
            />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search tools..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleSearchEnter}
              aria-label="Search tools"
              aria-autocomplete="list"
              aria-controls={isFocused && suggestions.length > 0 ? 'search-suggestions' : undefined}
              aria-expanded={isFocused && suggestions.length > 0}
              className={`w-full rounded-lg py-1.5 pl-9 pr-20 text-sm border focus:outline-none transition-all ${
                navBg
                  ? 'border-transparent'
                  : 'bg-slate-100/80 dark:bg-white/[0.06] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-white/[0.08] border-transparent'
              }`}
              style={inputStyle}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {query ? (
                <button
                  onClick={clearSearch}
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
            <div id="search-suggestions" role="listbox" aria-label="Search suggestions" className="absolute top-full mt-1.5 w-full bg-white dark:bg-[#1A1D2E] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Results
              </div>
              {suggestions.map((tool) => (
                <button
                  key={tool.id}
                  role="option"
                  aria-selected={false}
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
        <div className="flex items-center gap-0.5 ml-3">
          {/* Mobile search icon */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className={`md:hidden p-2 rounded-lg transition-colors ${navText ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            style={navText ? { color: navText } : undefined}
            aria-label="Search"
            title="Search tools"
          >
            <Search size={17} />
          </button>

          {/* Tool help — only when current tool or page has helpConfig */}
          {toolHelpConfig && (
            <ToolHelpPanel config={toolHelpConfig} />
          )}

          {/* Share */}
          <div className="hidden sm:block">
            <ShareButton navText={navText} />
          </div>

          {/* Theme customizer */}
          <AccentColorPicker navText={navText} />

          {/* My Home (pinned tools) */}
          <Link
            href="/my-home"
            className={`p-2 rounded-lg transition-colors ${navText ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            style={navText ? { color: navText } : undefined}
            aria-label="My Home — pinned tools"
            title="My Home"
          >
            <Star size={16} />
          </Link>

          {/* All Tools */}
          <Link
            href="/home"
            className={`p-2 rounded-lg transition-colors ${navText ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            style={navText ? { color: navText } : undefined}
            aria-label="All Tools — full catalog"
            title="All Tools"
          >
            <LayoutGrid size={17} />
          </Link>

          {/* Learning Center */}
          <Link
            href="/learn"
            className={`hidden sm:flex p-2 rounded-lg transition-colors ${navText ? 'hover:bg-black/5 dark:hover:bg-white/5' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            style={navText ? { color: navText } : undefined}
            aria-label="Learning Center"
            title="Learning Center"
          >
            <GraduationCap size={17} />
          </Link>
        </div>
      </header>
    </>
  );
}

export default function GlobalHeader() {
  return (
    <Suspense fallback={
      <div className="h-14 border-b bg-white/80 dark:bg-[#0F111A]/80 border-slate-200/60 dark:border-white/[0.06]" />
    }>
      <HeaderContent />
    </Suspense>
  );
}
