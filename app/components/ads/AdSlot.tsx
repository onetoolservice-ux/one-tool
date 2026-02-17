'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
}

/**
 * Google AdSense slot. Renders nothing unless NEXT_PUBLIC_ADSENSE_ID is set.
 * To enable: set NEXT_PUBLIC_ADSENSE_ID in your .env and add the slot ID.
 */
export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const pushed = useRef(false);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch { /* adsbygoogle not loaded */ }
  }, [adsenseId]);

  // Don't render anything if no AdSense ID configured
  if (!adsenseId) return null;

  return (
    <div className={`ad-container overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
