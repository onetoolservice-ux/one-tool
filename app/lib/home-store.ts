/**
 * My Home Store — v2 (Spaces)
 * Manages: spaces (named workspaces with pinned tools), visit history, first-visit flag
 * Storage key: 'onetool-my-home'
 *
 * v1 → v2 migration: flat `pins[]` is wrapped into the default "My Home" space automatically.
 */

const KEY     = 'onetool-my-home';
const VERSION = 2;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Space {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;   // the "My Home" space cannot be deleted
  pins: string[];        // tool IDs pinned to this space
  createdAt: number;
}

interface StoreV2 {
  version: number;
  spaces: Space[];
  activeSpaceId: string;
  recentlyUsed: { id: string; at: number }[];
  hasVisited: boolean;
}

// ── Defaults & migration ──────────────────────────────────────────────────────

function defaultMyHome(pins: string[] = []): Space {
  return {
    id: 'my-home',
    name: 'My Home',
    emoji: '🏠',
    isDefault: true,
    pins,
    createdAt: Date.now(),
  };
}

function defaultStore(): StoreV2 {
  return {
    version: VERSION,
    spaces: [defaultMyHome()],
    activeSpaceId: 'my-home',
    recentlyUsed: [],
    hasVisited: false,
  };
}

function migrate(raw: any): StoreV2 {
  if (!raw || typeof raw !== 'object') return defaultStore();

  // v1 → v2: flat pins array
  if (!raw.version || raw.version < 2) {
    return {
      version: VERSION,
      spaces: [defaultMyHome(Array.isArray(raw.pins) ? raw.pins : [])],
      activeSpaceId: 'my-home',
      recentlyUsed: Array.isArray(raw.recentlyUsed) ? raw.recentlyUsed : [],
      hasVisited: !!raw.hasVisited,
    };
  }

  // Ensure default space always exists
  const spaces: Space[] = Array.isArray(raw.spaces) ? raw.spaces : [];
  if (!spaces.find((s: Space) => s.id === 'my-home')) {
    spaces.unshift(defaultMyHome());
  }

  return {
    version: VERSION,
    spaces,
    activeSpaceId: raw.activeSpaceId || 'my-home',
    recentlyUsed: Array.isArray(raw.recentlyUsed) ? raw.recentlyUsed : [],
    hasVisited: !!raw.hasVisited,
  };
}

// ── Storage ───────────────────────────────────────────────────────────────────

function load(): StoreV2 {
  if (typeof window === 'undefined') return defaultStore();
  try {
    const raw = localStorage.getItem(KEY);
    return migrate(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultStore();
  }
}

function save(store: StoreV2): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* quota */ }
}

function dispatch(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('onetool-home-updated'));
  }
}

// ── Spaces ────────────────────────────────────────────────────────────────────

export function getSpaces(): Space[] {
  return load().spaces;
}

export function getActiveSpaceId(): string {
  return load().activeSpaceId;
}

export function getActiveSpace(): Space {
  const s = load();
  return s.spaces.find(sp => sp.id === s.activeSpaceId) ?? s.spaces[0];
}

export function setActiveSpace(id: string): void {
  const s = load();
  if (s.spaces.find(sp => sp.id === id)) {
    s.activeSpaceId = id;
    save(s);
    dispatch();
  }
}

export function addSpace(name: string, emoji = '📁'): Space {
  const s = load();
  const newSpace: Space = {
    id: `space-${Date.now()}`,
    name: name.trim().slice(0, 24),
    emoji,
    isDefault: false,
    pins: [],
    createdAt: Date.now(),
  };
  s.spaces.push(newSpace);
  s.activeSpaceId = newSpace.id;
  save(s);
  dispatch();
  return newSpace;
}

export function deleteSpace(id: string): void {
  const s = load();
  const space = s.spaces.find(sp => sp.id === id);
  if (!space || space.isDefault) return; // can't delete default
  s.spaces = s.spaces.filter(sp => sp.id !== id);
  if (s.activeSpaceId === id) {
    s.activeSpaceId = s.spaces[0]?.id ?? 'my-home';
  }
  save(s);
  dispatch();
}

export function renameSpace(id: string, name: string, emoji?: string): void {
  const s = load();
  const space = s.spaces.find(sp => sp.id === id);
  if (!space) return;
  space.name = name.trim().slice(0, 24);
  if (emoji) space.emoji = emoji;
  save(s);
  dispatch();
}

// ── Pins (space-aware) ────────────────────────────────────────────────────────

export function getPinsForSpace(spaceId: string): string[] {
  const s = load();
  return s.spaces.find(sp => sp.id === spaceId)?.pins ?? [];
}

export function getPins(): string[] {
  // Legacy compat: returns My Home pins
  return getPinsForSpace('my-home');
}

export function hasPins(): boolean {
  return load().spaces.some(sp => sp.pins.length > 0);
}

export function isPinned(toolId: string): boolean {
  // For ToolCard: checks My Home space
  return getPinsForSpace('my-home').includes(toolId);
}

export function addPin(toolId: string, spaceId = 'my-home'): void {
  const s = load();
  const space = s.spaces.find(sp => sp.id === spaceId);
  if (!space) return;
  if (!space.pins.includes(toolId)) {
    space.pins.push(toolId);
    save(s);
    dispatch();
  }
}

export function removePin(toolId: string, spaceId = 'my-home'): void {
  const s = load();
  const space = s.spaces.find(sp => sp.id === spaceId);
  if (!space) return;
  space.pins = space.pins.filter(id => id !== toolId);
  save(s);
  dispatch();
}

export function setPinsForSpace(spaceId: string, pins: string[]): void {
  const s = load();
  const space = s.spaces.find(sp => sp.id === spaceId);
  if (!space) return;
  space.pins = pins;
  save(s);
  dispatch();
}

// ── Visit tracking ────────────────────────────────────────────────────────────

export function isFirstVisit(): boolean { return !load().hasVisited; }

export function markVisited(): void {
  const s = load();
  if (!s.hasVisited) { s.hasVisited = true; save(s); }
}

export function recordVisit(id: string): void {
  const s = load();
  s.recentlyUsed = [
    { id, at: Date.now() },
    ...s.recentlyUsed.filter(r => r.id !== id),
  ].slice(0, 20);
  save(s);
}

export function getRecentlyUsed(limit = 10): string[] {
  return load().recentlyUsed.slice(0, limit).map(r => r.id);
}

// ── Search intent ─────────────────────────────────────────────────────────────

export function getSearchReferrer(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const ref = document.referrer;
    if (!ref) return null;
    const engines = ['google.', 'bing.com', 'duckduckgo.com', 'yahoo.com'];
    if (!engines.some(e => ref.includes(e))) return null;
    const url = new URL(ref);
    return url.searchParams.get('q') || url.searchParams.get('query') || null;
  } catch { return null; }
}
