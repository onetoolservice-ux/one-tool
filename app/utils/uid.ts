/**
 * Simple uid generator used across the app.
 * Deterministic enough for demo / local usage.
 */
export function uid(prefix = ""): string {
  // timestamp + random base36 suffix
  return prefix + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}
