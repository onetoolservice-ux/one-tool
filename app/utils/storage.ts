// Safe read with SSR-protection
export function readStorage<T = any>(key: string, fallback: T | null = null): T | null {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Safe write with SSR-protection
export function writeStorage(key: string, data: any): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage write failed:", e);
  }
}
