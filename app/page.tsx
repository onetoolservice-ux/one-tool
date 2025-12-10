'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CategoryNav from '@/app/components/home/CategoryNav';
import { ToolGrid } from '@/app/components/home/tool-grid';

// Create a sub-component to handle the Search Params logic
function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Initialize state from URL param or default to 'all'
  const initialCategory = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Sync state if URL changes (e.g. Back button pressed)
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setActiveCategory(cat);
  }, [searchParams]);

  // Update URL without full reload when changing tabs
  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    // Push new state to URL so "Back" button works correctly later
    router.push(`/?category=${id}`, { scroll: false });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] transition-colors duration-300 overflow-hidden">
      
      <CategoryNav active={activeCategory} onChange={handleCategoryChange} />

      <main className="flex-1 w-full max-w-[1800px] mx-auto overflow-y-auto custom-scrollbar p-6 md:p-8">
         <div className="flex items-center justify-between px-1 mb-4">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
             {activeCategory === 'all' ? 'All Applications' : activeCategory}
           </h2>
           <span className="text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-mono">
             SYSTEM READY
           </span>
         </div>

         <ToolGrid category={activeCategory} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    // Suspense boundary needed for useSearchParams in Client Component
    <Suspense fallback={<div className="min-h-screen bg-[#0F111A]" />}>
      <HomeContent />
    </Suspense>
  );
}
