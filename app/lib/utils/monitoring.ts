/**
 * Basic Monitoring and Error Tracking
 * 
 * This is a basic implementation. For production, integrate with:
 * - Sentry (error tracking)
 * - LogRocket (session replay)
 * - Vercel Analytics (performance)
 * - Custom analytics service
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Log error to console (development) and prepare for production tracking
 */
export function logError(error: Error | unknown, context?: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Console logging (always)
  console.error('Error:', errorMessage, {
    ...context,
    stack: errorStack,
  });
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry or similar
    // Sentry.captureException(error, {
    //   tags: context,
    //   extra: context?.metadata,
    // });
    
    // For now, log to console (will be captured by Vercel logs)
    if (typeof window !== 'undefined') {
      // Client-side: Could send to analytics endpoint
      // fetch('/api/log-error', { method: 'POST', body: JSON.stringify({ error, context }) });
    }
  }
}

/**
 * Log performance metric
 */
export function logPerformance(metric: string, value: number, unit: string = 'ms'): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric}: ${value}${unit}`);
  }
  
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Could integrate with Vercel Analytics or custom endpoint
    // window.gtag?.('event', 'timing_complete', {
    //   name: metric,
    //   value: value,
    //   event_category: 'Performance',
    // });
  }
}

/**
 * Log user action for analytics
 */
export function logAction(action: string, metadata?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Action] ${action}`, metadata);
  }
  
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Could integrate with Google Analytics or custom analytics
    // window.gtag?.('event', action, metadata);
  }
}
