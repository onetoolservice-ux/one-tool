'use client';

/**
 * useUrlPreset — Read initial values from URL search params on mount.
 * Does NOT write back to URL (avoids history spam). Instead provides
 * a `getShareUrl()` helper that builds a shareable link on demand.
 */

export function readUrlParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

/** Build a share URL from the current path + given params (only non-default values) */
export function buildShareUrl(params: Record<string, string | number>): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.search = '';
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v !== undefined && v !== null) {
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}
