'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Script from 'next/script';
import { useSearchParams, useRouter } from 'next/navigation';
import { ToolGrid } from '@/app/components/home/tool-grid';
import CategoryNav from '@/app/components/home/CategoryNav';
import { PinHintBanner } from '@/app/components/home/PinHintBanner';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'One Tool Solutions — All Tools',
  url: 'https://onetool.co.in/home',
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  // Derive active category ID from URL param (normalised slug or "all")
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (!categoryParam) return 'all';
    return categoryParam.toLowerCase();
  });

  // Sync category state when URL param changes (e.g. from header search or back nav)
  useEffect(() => {
    setActiveCategory(categoryParam ? categoryParam.toLowerCase() : 'all');
  }, [categoryParam]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    // Update URL so the state is shareable/bookmarkable
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    // Remove search when switching categories
    params.delete('search');
    router.push(`/home?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex bg-gray-50 dark:bg-[#0F111A] transition-colors duration-300" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <Script id="catalog-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      {/* Sidebar — desktop only; mobile strip is rendered inside CategoryNav */}
      <CategoryNav active={activeCategory} onChange={handleCategoryChange} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 pt-4 pb-8 min-w-0">
        <PinHintBanner />
        <ToolGrid
          searchQuery={searchQuery}
          categoryFilter={activeCategory === 'all' ? undefined : activeCategory}
        />
      </main>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div className="hidden md:block w-[210px] flex-shrink-0 bg-white dark:bg-[#0d0f1a] border-r border-slate-200/50 dark:border-white/[0.05]" />
        <div className="flex-1 bg-gray-50 dark:bg-[#0F111A]" />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
