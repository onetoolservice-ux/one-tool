'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  hasPins, isFirstVisit, markVisited, getSearchReferrer,
} from '@/app/lib/home-store';
import { MyHomePage } from '@/app/components/home/MyHomePage';
import { LandingPage } from '@/app/components/home/LandingPage';

type ViewState = 'loading' | 'landing' | 'my-home';

function SmartHome() {
  const [view, setView] = useState<ViewState>('loading');
  const [searchIntent, setSearchIntent] = useState<string | null>(null);

  useEffect(() => {
    // Detect search engine intent (client-side only)
    const intent = getSearchReferrer();
    setSearchIntent(intent);

    // Decide which view to show
    const firstVisit = isFirstVisit();
    markVisited();

    if (!firstVisit && hasPins()) {
      setView('my-home');
    } else {
      // First-time visitor OR returning without pins → landing page
      setView('landing');
    }
  }, []);

  if (view === 'loading') {
    return <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]" />;
  }

  if (view === 'my-home') {
    return <MyHomePage searchIntent={searchIntent} />;
  }

  return <LandingPage searchIntent={searchIntent} />;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F111A]" />}>
      <SmartHome />
    </Suspense>
  );
}
