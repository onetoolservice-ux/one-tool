'use client';

import { useEffect, useState } from 'react';
import { MyHomePage } from '@/app/components/home/MyHomePage';
import { LandingPage } from '@/app/components/home/LandingPage';
import { isFirstVisit, markVisited } from '@/app/lib/home-store';

export default function Home() {
  // null = not yet determined (avoid SSR mismatch)
  const [showLanding, setShowLanding] = useState<boolean | null>(null);

  useEffect(() => {
    const first = isFirstVisit();
    setShowLanding(first);
    if (first) markVisited();
  }, []);

  // Prevent flash of wrong page before localStorage is read
  if (showLanding === null) return null;

  return showLanding ? <LandingPage /> : <MyHomePage />;
}
