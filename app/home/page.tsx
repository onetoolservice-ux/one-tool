'use client';

import React, { Suspense } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import { ToolGrid } from '@/app/components/home/tool-grid';
import { PinHintBanner } from '@/app/components/home/PinHintBanner';

function CatalogContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'One Tool Solutions — All Tools',
    url: 'https://onetool.co.in/home',
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-[#0F111A] transition-colors duration-300">
      <Script id="catalog-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
      <main className="overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 pt-4 pb-8">
        <PinHintBanner />
        <ToolGrid searchQuery={searchQuery} />
      </main>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F111A]" />}>
      <CatalogContent />
    </Suspense>
  );
}
