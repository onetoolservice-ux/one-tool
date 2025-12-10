'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, Command, Share2, Star, Home, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { fuzzySearch } from '@/app/lib/search-utils'; // Import the new utility

// FULL TOOL LIST FOR SEARCH (Synced with ToolGrid)
const SEARCH_TOOLS = [
  { id: 'life-os', title: 'Life OS', category: 'productivity' },
  { id: 'pomodoro', title: 'Focus Timer', category: 'productivity' },
  { id: 'qr-code', title: 'QR Generator', category: 'productivity' },
  { id: 'smart-pass', title: 'Password Generator', category: 'productivity' },
  { id: 'invoice-generator', title: 'Invoice Maker', category: 'business' },
  { id: 'salary-slip', title: 'Salary Slip', category: 'business' },
  { id: 'rent-receipt', title: 'Rent Receipt', category: 'business' },
  { id: 'id-card', title: 'ID Card Maker', category: 'business' },
  { id: 'smart-agreement', title: 'Agreement Builder', category: 'business' },
  { id: 'smart-scan', title: 'Smart Scan', category: 'documents' },
  { id: 'smart-ocr', title: 'Smart OCR', category: 'documents' },
  { id: 'pdf-workbench', title: 'PDF Workbench', category: 'documents' },
  { id: 'pdf-splitter', title: 'PDF Splitter', category: 'documents' },
  { id: 'image-compressor', title: 'Image Compressor', category: 'documents' },
  { id: 'image-converter', title: 'Image Converter', category: 'documents' },
  { id: 'csv-studio', title: 'CSV Studio', category: 'documents' },
  { id: 'markdown-studio', title: 'Markdown Studio', category: 'documents' },
  { id: 'universal-converter', title: 'File Converter', category: 'documents' },
  { id: 'api-playground', title: 'API Playground', category: 'developer' },
  { id: 'dev-station', title: 'Dev Station', category: 'developer' },
  { id: 'git-cheats', title: 'Git Cheatsheet', category: 'developer' },
  { id: 'cron-gen', title: 'Cron Generator', category: 'developer' },
  { id: 'jwt-debugger', title: 'JWT Debugger', category: 'developer' },
  { id: 'diff-studio', title: 'Diff Studio', category: 'developer' },
  { id: 'string-studio', title: 'String Tools', category: 'developer' },
  { id: 'json-editor', title: 'JSON Editor', category: 'developer' },
  { id: 'sql-editor', title: 'SQL Editor', category: 'developer' },
  { id: 'budget-planner', title: 'Budget Planner', category: 'finance' },
  { id: 'net-worth', title: 'Net Worth', category: 'finance' },
  { id: 'investment', title: 'Investment Calculator', category: 'finance' },
  { id: 'loan-calc', title: 'Loan Calculator', category: 'finance' },
  { id: 'gst-calc', title: 'GST Calculator', category: 'finance' },
  { id: 'retirement', title: 'Retirement Planner', category: 'finance' },
  { id: 'smart-bmi', title: 'BMI Calculator', category: 'health' },
  { id: 'box-breathing', title: 'Box Breathing', category: 'health' },
  { id: 'hiit-timer', title: 'HIIT Timer', category: 'health' },
  { id: 'smart-chat', title: 'AI Assistant', category: 'ai' },
  { id: 'smart-analyze', title: 'Sentiment AI', category: 'ai' },
  { id: 'color-picker', title: 'Color Studio', category: 'design' },
  { id: 'unit-convert', title: 'Unit Converter', category: 'converters' },
];

export default function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHome = pathname === '/';
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<typeof SEARCH_TOOLS>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const category = pathSegments[1]; 
  const toolName = pathSegments[2]?.replace(/-/g, ' ');

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions using Fuzzy Search
  useEffect(() => {
    if (query.length > 0) {
      // FIX: Use our new fuzzySearch utility
      const matches = fuzzySearch(query, SEARCH_TOOLS).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push(`/?search=${encodeURIComponent(query)}`);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (tool: typeof SEARCH_TOOLS[0]) => {
    router.push(`/tools/${tool.category}/${tool.id}`);
    setQuery('');
    setIsFocused(false);
  };

  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300 bg-white dark:bg-[#0F111A]">
      {/* LEFT: LOGO */}
      <div className="flex items-center gap-4 mr-8 min-w-fit">
        {isHome ? (
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
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

      {/* CENTER: SEARCH */}
      <div className="flex-1 max-w-xl hidden md:block relative" ref={searchRef}>
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Search tools (e.g. 'pdf' or 'invice')..."
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onFocus={() => setIsFocused(true)}
               onKeyDown={handleSearchEnter}
               className="w-full rounded-lg py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all bg-gray-50 dark:bg-[#1C1F2E] text-gray-900 dark:text-white border-transparent focus:bg-white dark:focus:bg-[#0F111A] border border-transparent focus:border-emerald-500/20"
            />
            {query && (
              <button onClick={() => { setQuery(''); router.push('/'); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
         </div>

         {/* LIVE SUGGESTIONS */}
         {isFocused && query && suggestions.length > 0 && (
           <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
             <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {/* FIX: Show context if it's a fuzzy match */}
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

      {/* RIGHT: ACTIONS */}
      <div className="flex items-center gap-2 ml-4">
         <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-mono mr-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Live</span>
         </div>
         <div className="h-5 w-px mx-1 hidden lg:block bg-gray-200 dark:bg-white/10"></div>
         <ThemeToggle />
         <button className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"><Share2 size={18} /></button>
         <button className="p-2 rounded-lg transition-colors text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"><Star size={18} /></button>
      </div>
    </header>
  );
}
