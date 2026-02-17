'use client';

/**
 * Telemetry — sends events to Google Analytics 4 via gtag.
 * Falls back to console.debug in development.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  // Send to GA4 if loaded
  if (window.gtag) {
    window.gtag('event', event, properties);
  }

  if (process.env.NODE_ENV === 'development') {
    console.debug('[telemetry]', event, properties);
  }
}

export function trackToolOpened(toolId: string, category?: string) {
  trackEvent('tool_opened', { tool_id: toolId, tool_category: category });
}

export function trackToolEngagement(toolId: string, durationMs: number) {
  trackEvent('tool_engagement', {
    tool_id: toolId,
    duration_seconds: Math.round(durationMs / 1000),
    engagement_time_msec: durationMs,
  });
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', { search_term: query, results_count: resultsCount });
}

export function trackShare(toolId: string, method: string) {
  trackEvent('share', { tool_id: toolId, method });
}

export function trackFeedback(toolId: string, rating: number, text?: string) {
  trackEvent('feedback_submit', { tool_id: toolId, rating, has_text: !!text });
}
