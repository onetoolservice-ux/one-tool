"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Briefcase, Mic, Command, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/app/components/layout/theme-provider';
import { LiveClock } from '@/app/components/layout/live-clock';
import { ALL_TOOLS } from '@/app/lib/tools-data';

// --- STABLE SEARCH COMPONENT (Defined Outside) ---
const SearchInput = ({ 
  compact, 
  searchTerm, 
  setSearchTerm, 
  inputRef, 
  isListening, 
  startListening 
}: { 
  compact: boolean, 
  searchTerm: string, 
  setSearchTerm: (v: string) => void, 
  inputRef: any, 
  isListening: boolean, 
  startListening: () => void 
}) => (
  <div className={`relative group transition-all duration-300 ${compact ? 'w-64' : 'w-full'}`}>
    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors ${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
    <input 
      ref={inputRef}
      type="text" 
      placeholder={compact ? "Jump to tool..." : "Search tools (Ctrl + K)..."}
      className={`
        w-full rounded-xl outline-none transition-all
        bg-slate-100 dark:bg-slate-900 
        border border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-black
        text-slate-700 dark:text-slate-200 placeholder:text-slate-400
        ${compact ? 'h-9 pl-9 pr-12 text-xs focus:w-80 focus:absolute focus:right-0 z-50 focus:shadow-lg' : 'h-11 pl-10 pr-16 text-sm shadow-sm'}
      `} 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
       {searchTerm ? (
         <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-rose-500 transition-colors p-1"><X size={14} /></button> 
       ) : (
         <div className="flex items-center gap-1 pointer-events-none opacity-50 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">⌘K</span>
         </div>
       )}
       {!compact && (
          <button onClick={startListening} className={`ml-1 p-1.5 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30'}`}>
            {isListening ? <Loader2 size={14} className="animate-spin"/> : <Mic size={14} />}
          </button>
       )}
    </div>
  </div>
);

export const SuperNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'All Tools';
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHome = pathname === '/';
  const categories = ["All Tools", "Business", "Finance", "Documents", "Developer", "Productivity", "Health", "AI", "Design", "Converters"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) params.set('q', searchTerm);
      else params.delete('q');
      
      // Only redirect if the search term is different from URL
      if (searchTerm !== (searchParams.get('q') || '')) {
        if (!isHome && searchTerm) router.push(`/?${params.toString()}`);
        else router.replace(`/?${params.toString()}`);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, router, searchParams, isHome]);

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().replace(/[.,]/g, '');
      setSearchTerm(transcript);
      setIsListening(false);
      const foundTool = ALL_TOOLS.find(t => t.name.toLowerCase() === transcript);
      if (foundTool) router.push(foundTool.href);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All Tools") params.delete('cat');
    else params.set('cat', cat);
    setSearchTerm(''); 
    params.delete('q');
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex h-16 items-center px-6 max-w-[1600px] mx-auto justify-between gap-6">
        
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-slate-900 dark:text-white shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center shadow-sm">O</div>
          <span className="hidden sm:inline">OneTool.</span>
        </Link>
        
        <div className="flex-1 flex justify-center max-w-lg mx-auto">
           {isHome ? (
             <SearchInput 
               compact={false} 
               searchTerm={searchTerm} 
               setSearchTerm={setSearchTerm} 
               inputRef={inputRef}
               isListening={isListening}
               startListening={startListening}
             />
           ) : <div />} 
        </div>

        <div className="flex items-center gap-4 shrink-0">
           {!isHome && (
             <SearchInput 
               compact={true} 
               searchTerm={searchTerm} 
               setSearchTerm={setSearchTerm} 
               inputRef={inputRef}
               isListening={isListening}
               startListening={startListening}
             />
           )}
           
           <div className="hidden md:flex items-center gap-4">
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
              <LiveClock />
           </div>
           
           <ThemeToggle />
           <button className="hidden md:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">Get Pro</button>
        </div>
      </div>

      {isHome && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="max-w-7xl mx-auto">
            <div className="flex h-12 items-center px-6 overflow-x-auto no-scrollbar gap-6">
              {categories.map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => handleCategoryClick(cat)} 
                  className={`text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full ${activeCategory === cat && !searchTerm ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 ring-1 ring-teal-200 dark:ring-teal-800' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {cat === 'Business' && <Briefcase size={12} className="-mt-0.5"/>}
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
