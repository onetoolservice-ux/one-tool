'use client';

import { useEffect } from 'react';

/**
 * Invisible client component — sets the "returning user" flag in localStorage
 * the moment a user visits any Space page. This collapses the landing page
 * hero on their next visit, showing only the category grid.
 */
export function SpaceTracker() {
  useEffect(() => {
    try { localStorage.setItem('otsd-returning', '1'); } catch { /* ignore */ }
  }, []);
  return null;
}
