import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only capture errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Capture 10% of sessions for session replay
  replaysSessionSampleRate: 0.1,

  // Capture 100% of sessions that had an error
  replaysOnErrorSampleRate: 1.0,

  // Ignore common benign errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error exception captured',
    'ChunkLoadError',
    /Loading chunk \d+ failed/,
  ],

});
