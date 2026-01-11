'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Script from 'next/script';
import { useSearchParams, useRouter } from 'next/navigation';
import CategoryNav from '@/app/components/home/CategoryNav';
import { ToolGrid } from '@/app/components/home/tool-grid';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    router.push(`/?category=${id}`, { scroll: false });
  };

  // FIX: Home Page Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'One Tool Solutions',
    url: 'https://onetool.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://onetool.com/?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] transition-colors duration-300 overflow-hidden">
      {/* Schema injected here - Safe JSON-LD injection */}
      <Script
        id="home-schema"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      
      <CategoryNav active={activeCategory} onChange={handleCategoryChange} />

      <main className="flex-1 w-full max-w-[1800px] mx-auto overflow-y-auto custom-scrollbar p-6 md:p-8">
         <div className="flex items-center justify-between px-1 mb-4">
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
             {searchQuery ? `Results for "${searchQuery}"` : (activeCategory === 'all' ? 'All Applications' : activeCategory)}
           </h2>
           <span className="text-[10px] bg-gray-200 dark:bg-white/10 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-mono">
             {searchQuery ? 'SEARCH' : 'SYSTEM READY'}
           </span>
         </div>

         <ToolGrid category={activeCategory} searchQuery={searchQuery} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F111A]" />}>
      <HomeContent />
    </Suspense>
  );
}
