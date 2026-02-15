'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Command, Share2, Coffee, Home, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLogo from '@/app/components/BrandLogo';
import { fuzzySearch } from '@/app/lib/search-utils';
import { ALL_TOOLS } from '@/app/lib/tools-data';

// --- SEARCH DATA --- (Derived from ALL_TOOLS - no hardcoding needed)
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

  // New: ref for the input and header shrink state
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isShrunk, setIsShrunk] = useState(false);

  // Shrink header on scroll to save vertical real estate
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setIsShrunk(window.scrollY > 30);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K focuses the global search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      if ((e.ctrlKey || e.metaKey) && isK) {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const matches = fuzzySearch(SEARCH_TOOLS, query).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Sanitize query before navigation
      const sanitizedQuery = query.trim().replace(/[<>"']/g, '');
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
    <header className={`${isShrunk ? 'h-12' : 'h-16'} border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-300 bg-white dark:bg-[#0F111A]` }>
      <div className="flex items-center gap-4 mr-8 min-w-fit">
        {isHome ? (
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo size={36} className="rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">OneTool<span className="text-emerald-500">.</span></span>
          </Link>
        ) : (
          <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2">
             <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors py-2">
               <div className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                 <Home size={18} />
               </div>
             </Link>
             {category && (
               <>
                 <span className="text-gray-300 dark:text-gray-600">/</span>
                 <Link href={`/?category=${category}`} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white capitalize transition-colors">{category}</Link>
               </>
             )}
             {toolName && (
               <>
                 <span className="text-gray-300 dark:text-gray-600">/</span>
                 <span className="font-bold text-gray-900 dark:text-white capitalize truncate max-w-[200px]">{toolName}</span>
               </>
             )}
          </div>
        )}
      </div>

      <div className="flex-1 max-w-xl hidden md:block relative" ref={searchRef}>
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
               id="global-search-input"
               ref={searchInputRef}
               type="text" 
               placeholder="Search tools (e.g. 'pdf' or 'invoice') — Ctrl/Cmd+K"
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onFocus={() => setIsFocused(true)}
               onKeyDown={handleSearchEnter}
               className="w-full rounded-lg py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all bg-gray-50 dark:bg-[#1C1F2E] text-gray-900 dark:text-white border-transparent focus:bg-white dark:focus:bg-[#0F111A] border border-transparent focus:border-emerald-500/20"
            />
            {query && (
              <button 
                onClick={() => { setQuery(''); router.push('/'); }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
         </div>

         {isFocused && query && suggestions.length > 0 && (
           <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
             <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {suggestions[0].title.toLowerCase().includes(query.toLowerCase()) ? 'Suggestions' : 'Did you mean?'}
             </div>
             {suggestions.map((tool) => (
               <button
                 key={tool.id}
                 onClick={() => handleSuggestionClick(tool)}
                 className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between group transition-colors"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                     <Command size={14} />
                   </div>
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors">{tool.title}</span>
                 </div>
                 <span className="text-[10px] text-gray-400 capitalize bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">{tool.category}</span>
               </button>
             ))}
           </div>
         )}
      </div>

      <div className="flex items-center gap-2 ml-4">
         <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-mono mr-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Live</span>
         </div>
         <div className="h-5 w-px mx-1 hidden lg:block bg-gray-200 dark:bg-white/10"></div>
         <LanguageSwitcher />
         <ThemeToggle />
         
         <button 
           className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
           aria-label="Share"
         >
            <Share2 size={18} />
         </button>
         
         {/* DONATION BUTTON */}
         <a
           href="https://buymeacoffee.com/onetool"
           target="_blank"
           rel="noopener noreferrer"
           className="p-2 rounded-lg transition-colors text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
           aria-label="Buy me a coffee"
         >
            <Coffee size={18} />
         </a>
      </div>
    </header>
  );
}

export default function GlobalHeader() {
  return (
    <Suspense fallback={<div className="h-16 bg-[#0F111A] border-b border-white/5" />}>
      <HeaderContent />
    </Suspense>
  );
}
