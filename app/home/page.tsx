'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';
import { useSearchParams, useRouter } from 'next/navigation';
import { ToolGrid } from '@/app/components/home/ToolGrid';
import CategoryNav from '@/app/components/home/CategoryNav';
import { ALL_TOOLS, CATEGORY_ORDER } from '@/app/lib/tools-data';
import { ChevronLeft, Search, X, RotateCcw } from 'lucide-react';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'One Tool Solutions — All Tools',
  url: 'https://onetool.co.in/home',
};

const SIDEBAR_KEY = 'onetool-sidebar-collapsed';

function resolveTitle(activeCategory: string) {
  if (activeCategory === 'all') return { label: 'All Tools', count: ALL_TOOLS.length };
  const cat = CATEGORY_ORDER.find(
    c => c.toLowerCase() === activeCategory || c.toLowerCase().replace(/[^a-z0-9]+/g, '-') === activeCategory
  );
  const label = cat ?? activeCategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const count = ALL_TOOLS.filter(
    t => t.category.toLowerCase() === activeCategory || t.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === activeCategory
  ).length;
  return { label, count };
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categoryParam = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [localSearch, setLocalSearch] = useState(urlSearch);
  useEffect(() => { setLocalSearch(urlSearch); }, [urlSearch]);

  const clearSearch = () => {
    setLocalSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/home?${params.toString()}`, { scroll: false });
    searchInputRef.current?.focus();
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved === 'true') setSidebarCollapsed(true);
    } catch { /* ignore */ }
  }, []);
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>(() =>
    categoryParam ? categoryParam.toLowerCase() : 'all'
  );
  useEffect(() => {
    setActiveCategory(categoryParam ? categoryParam.toLowerCase() : 'all');
  }, [categoryParam]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') params.delete('category');
    else params.set('category', cat);
    params.delete('search');
    setLocalSearch('');
    router.push(`/home?${params.toString()}`, { scroll: false });
  };

  const { label, count } = resolveTitle(activeCategory);
  const isFiltered = !!localSearch.trim() || activeCategory !== 'all';

  const handleReset = () => {
    setLocalSearch('');
    handleCategoryChange('all');
  };

  return (
    <div
      className="flex bg-[#f5f6f8] dark:bg-[#0F111A] transition-colors duration-300"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      <Script id="catalog-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* ── LEFT PANEL: toolbar + sidebar (same column) ───────────────────── */}
      <div className={`
        hidden md:flex flex-col flex-shrink-0
        bg-white dark:bg-[#0d0f1a]
        border-r border-slate-200 dark:border-white/[0.05]
        transition-[width] duration-200 ease-in-out overflow-hidden
        ${sidebarCollapsed ? 'w-10' : 'w-[216px]'}
      `}>

        {sidebarCollapsed ? (
          /* Collapsed: just the toggle button */
          <div className="flex justify-center pt-3">
            <button
              onClick={toggleSidebar}
              aria-label="Show categories"
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-[var(--ot-accent,#6366f1)] hover:border-[var(--ot-accent,#6366f1)]/40 transition-all"
            >
              <ChevronLeft size={13} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
        ) : (
          /* Expanded: toolbar rows + category list */
          <>
            {/* Row 1: toggle | title | reset */}
            <div className="flex items-center h-10 px-2 gap-1.5 flex-shrink-0 border-b border-slate-100 dark:border-white/[0.04]">
              <button
                onClick={toggleSidebar}
                aria-label="Hide categories"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-[var(--ot-accent,#6366f1)] hover:border-[var(--ot-accent,#6366f1)]/40 transition-all flex-shrink-0"
              >
                <ChevronLeft size={13} />
              </button>

              <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0 overflow-hidden">
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-none">
                  {label}
                </span>
                <span className="text-[10px] text-slate-900 dark:text-white opacity-40 tabular-nums flex-shrink-0 leading-none">
                  ({count})
                </span>
              </div>

              {isFiltered ? (
                <button
                  onClick={handleReset}
                  aria-label="Clear filters"
                  title="Clear all filters"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/[0.1] text-slate-400 hover:text-[var(--ot-accent,#6366f1)] hover:border-[var(--ot-accent,#6366f1)]/40 transition-all flex-shrink-0"
                >
                  <RotateCcw size={11} />
                </button>
              ) : (
                <div className="w-7 flex-shrink-0" />
              )}
            </div>

            {/* Row 2: search */}
            <div className="px-2 py-2 flex-shrink-0 border-b border-slate-100 dark:border-white/[0.04]">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  placeholder="Search"
                  className="
                    w-full h-7 pl-7 pr-7 text-[12px] rounded-md
                    bg-slate-100 dark:bg-white/[0.06]
                    border border-transparent
                    focus:border-[var(--ot-accent,#6366f1)]/40
                    focus:bg-white dark:focus:bg-white/[0.09]
                    focus:outline-none
                    text-slate-800 dark:text-slate-200
                    placeholder:text-slate-400 dark:placeholder:text-slate-500
                    transition-all
                  "
                />
                {localSearch && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* Category list */}
            <CategoryNav
              active={activeCategory}
              onChange={handleCategoryChange}
            />
          </>
        )}
      </div>

      {/* ── MOBILE: horizontal category strip ────────────────────────────── */}
      <div className="md:hidden absolute top-[56px] left-0 right-0 z-10">
        <CategoryNav active={activeCategory} onChange={handleCategoryChange} mobileOnly />
      </div>

      {/* ── MAIN CONTENT: full height, no toolbar above ───────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pt-5 pb-10 min-w-0">
        <ToolGrid
          searchQuery={localSearch.trim() || undefined}
          categoryFilter={activeCategory === 'all' ? undefined : activeCategory}
        />
      </main>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="hidden md:block w-[216px] flex-shrink-0 bg-white dark:bg-[#0d0f1a] border-r border-slate-200 dark:border-white/[0.05]" />
        <div className="flex-1 bg-[#f5f6f8] dark:bg-[#0F111A]" />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
