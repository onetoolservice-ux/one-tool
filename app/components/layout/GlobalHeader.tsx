'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Command, Share2, Star, Home } from 'lucide-react'; // Removed ArrowLeft
import { ThemeToggle } from './ThemeToggle';

export default function GlobalHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  
  // Parse path for breadcrumbs
  const pathSegments = pathname.split('/').filter(Boolean);
  const category = pathSegments[1]; 
  const toolName = pathSegments[2]?.replace(/-/g, ' ');

  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 transition-colors duration-300 bg-white dark:bg-[#0F111A]">
      
      {/* LEFT AREA */}
      <div className="flex items-center gap-4 mr-8 min-w-fit">
        {isHome ? (
          // HOME: Logo
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">OneTool<span className="text-emerald-500">.</span></span>
          </Link>
        ) : (
          // TOOL PAGE: Just Breadcrumbs (No Back Arrow)
          <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2">
             
             {/* 1. Home Icon (Acts as the main 'Back to Home' link) */}
             <Link 
               href="/" 
               className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors py-2"
             >
               <div className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                 <Home size={18} />
               </div>
             </Link>

             {/* 2. Category Breadcrumb */}
             {category && (
               <>
                 <span className="text-gray-300 dark:text-gray-600">/</span>
                 <Link 
                   href={`/?category=${category}`}
                   className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white capitalize transition-colors"
                 >
                   {category}
                 </Link>
               </>
             )}
             
             {/* 3. Tool Name Breadcrumb */}
             {toolName && (
               <>
                 <span className="text-gray-300 dark:text-gray-600">/</span>
                 <span className="font-bold text-gray-900 dark:text-white capitalize truncate max-w-[200px]">
                   {toolName}
                 </span>
               </>
             )}
          </div>
        )}
      </div>

      {/* CENTER: SEARCH BAR */}
      <div className="flex-1 max-w-xl hidden md:block">
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
               type="text" 
               placeholder="Jump to tool..."
               className="w-full rounded-lg py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all bg-gray-50 dark:bg-[#1C1F2E] text-gray-900 dark:text-white border-transparent focus:bg-white dark:focus:bg-[#0F111A] border border-transparent focus:border-emerald-500/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
               <Command size={10} className="text-gray-500 dark:text-gray-400" />
               <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">K</span>
            </div>
         </div>
      </div>

      {/* RIGHT: ACTIONS */}
      <div className="flex items-center gap-2 ml-4">
         <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-mono mr-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Live</span>
         </div>

         <div className="h-5 w-px mx-1 hidden lg:block bg-gray-200 dark:bg-white/10"></div>

         <ThemeToggle />
         
         <button className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">
            <Share2 size={18} />
         </button>
         <button className="p-2 rounded-lg transition-colors text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5">
            <Star size={18} />
         </button>
      </div>
    </header>
  );
}
