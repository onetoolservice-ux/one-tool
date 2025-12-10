"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Command } from 'lucide-react';
import { ThemeToggle } from '@/app/components/layout/ThemeToggle';
import { LiveClock } from '@/app/components/layout/live-clock';

export const SuperNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // 1. ALL HOOKS MUST BE CALLED AT THE TOP LEVEL (Before any return)
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync with URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== query) setQuery(q || '');
  }, [searchParams]);

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. NOW we can conditionally return null if on a tool page
  if (pathname?.startsWith('/tools/')) return null;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val) router.push(`/?q=${encodeURIComponent(val)}`);
    else router.push('/');
  };

  const clearSearch = () => {
    setQuery('');
    router.push('/');
  };

  const CATEGORIES = ['All Tools', 'Business', 'Finance', 'Documents', 'Developer', 'Productivity', 'Health', 'AI', 'Design', 'Converters'];
  const activeCat = searchParams.get('cat') || 'All Tools';

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${isScrolled ? 'bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
           
           {/* LOGO */}
           <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Command size={18}/>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">OneTool.</span>
           </div>

           {/* SEARCH BAR */}
           <div className="flex-1 max-w-2xl relative group hidden md:block">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                 <Search size={18} />
              </div>
              <input 
                type="text" 
                value={query}
                onChange={handleSearch}
                className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                placeholder="Search tools (Ctrl + K)..."
              />
              {query && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                   <X size={16} />
                </button>
              )}
           </div>

           {/* ACTIONS */}
           <div className="flex items-center gap-3">
              <div className="hidden md:block"><LiveClock /></div>
              <ThemeToggle />
              <Link href="/?cat=Business" className="hidden md:flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
                 Get Pro
              </Link>
           </div>
        </div>

        {/* CATEGORY TABS (Scrollable) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar mask-fade">
           {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => router.push(cat === 'All Tools' ? '/' : `/?cat=${cat}`)}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${activeCat === cat ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                 {cat}
              </button>
           ))}
        </div>
      </div>
    </header>
  );
};