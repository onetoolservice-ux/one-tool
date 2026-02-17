'use client';

import { useEffect, useRef } from 'react';
import { trackToolEngagement } from '@/app/lib/telemetry';

/**
 * Tracks how long a user spends on a tool page.
 * Sends a GA event on unmount if user stayed > 5 seconds.
 */
export function useToolEngagement(toolId: string) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Date.now() - startTime.current;
      if (duration > 5000) {
        trackToolEngagement(toolId, duration);
      }
    };
  }, [toolId]);
}
