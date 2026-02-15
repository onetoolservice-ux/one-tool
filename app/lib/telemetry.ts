/**
 * Lightweight telemetry stub.
 * Replace with a real analytics provider (PostHog, Mixpanel, etc.) when needed.
 */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    // Silent in dev — uncomment below for debugging:
    // console.debug('[telemetry]', event, properties);
  }
}
