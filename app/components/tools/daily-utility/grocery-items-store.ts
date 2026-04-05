'use client';
// ══════════════════════════════════════════════════════════════════════════════
// Grocery Items Store — Daily Utility tool
// Designed by Claude · Storage key: otsd-grocery-items
//
// A focused grocery list manager organised by store sections.
// Supports quick-add, saved templates, checklist shopping mode, and export.
// ══════════════════════════════════════════════════════════════════════════════

import { safeLocalStorage } from '@/app/lib/utils/storage';

export const GI_STORAGE_KEY = 'otsd-grocery-items';
export const GI_VERSION = 1;

// ── Types ─────────────────────────────────────────────────────────────────────

export const STORE_SECTIONS = [
  'Produce',
  'Dairy & Eggs',
  'Bakery',
  'Meat & Fish',
  'Frozen Foods',
  'Beverages',
  'Snacks & Dry',
  'Pantry Staples',
  'Household',
  'Personal Care',
  'Baby & Kids',
  'Pet Supplies',
  'Other',
] as const;

export type StoreSection = (typeof STORE_SECTIONS)[number];

export const SECTION_EMOJI: Record<StoreSection, string> = {
  'Produce':        '🥦',
  'Dairy & Eggs':   '🥛',
  'Bakery':         '🍞',
  'Meat & Fish':    '🥩',
  'Frozen Foods':   '🧊',
  'Beverages':      '🥤',
  'Snacks & Dry':   '🍿',
  'Pantry Staples': '🫙',
  'Household':      '🏠',
  'Personal Care':  '🧴',
  'Baby & Kids':    '🍼',
  'Pet Supplies':   '🐾',
  'Other':          '📦',
};

export const UNIT_OPTIONS = [
  'pcs', 'kg', 'g', 'liters', 'ml',
  'box', 'pack', 'dozen', 'bottle', 'tube', 'bag', 'can', 'other',
] as const;

export type GroceryUnit = (typeof UNIT_OPTIONS)[number];

export interface GroceryItem {
  id: string;
  name: string;
  section: StoreSection;
  qty: number;
  unit: GroceryUnit;
  brand?: string;
  note?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  checked: boolean;
  addedAt: string;
}

export interface SavedTemplate {
  id: string;
  name: string;
  section: StoreSection;
  qty: number;
  unit: GroceryUnit;
  brand?: string;
  estimatedPrice?: number;
}

export interface GroceryStore {
  version: number;
  items: GroceryItem[];
  saved: SavedTemplate[];
  listName: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

function defaultStore(): GroceryStore {
  return {
    version: GI_VERSION,
    items: [],
    saved: [],
    listName: 'My Grocery List',
  };
}

// ── Persistence ───────────────────────────────────────────────────────────────

export function loadGIStore(): GroceryStore {
  try {
    const raw = safeLocalStorage.getItem(GI_STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as GroceryStore;
    return { ...defaultStore(), ...parsed };
  } catch {
    return defaultStore();
  }
}

export function saveGIStore(store: GroceryStore): void {
  safeLocalStorage.setItem(GI_STORAGE_KEY, JSON.stringify(store));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fmtPrice(n?: number): string {
  if (n == null || isNaN(n)) return '—';
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ── Items CRUD ────────────────────────────────────────────────────────────────

export function addItem(
  store: GroceryStore,
  fields: Omit<GroceryItem, 'id' | 'checked' | 'addedAt'>,
): GroceryStore {
  const item: GroceryItem = {
    ...fields,
    id: uid(),
    checked: false,
    addedAt: new Date().toISOString(),
  };
  return { ...store, items: [...store.items, item] };
}

export function updateItem(
  store: GroceryStore,
  id: string,
  patch: Partial<GroceryItem>,
): GroceryStore {
  return {
    ...store,
    items: store.items.map(i => (i.id === id ? { ...i, ...patch } : i)),
  };
}

export function deleteItem(store: GroceryStore, id: string): GroceryStore {
  return { ...store, items: store.items.filter(i => i.id !== id) };
}

export function toggleChecked(store: GroceryStore, id: string): GroceryStore {
  return {
    ...store,
    items: store.items.map(i =>
      i.id === id ? { ...i, checked: !i.checked } : i,
    ),
  };
}

export function clearChecked(store: GroceryStore): GroceryStore {
  return { ...store, items: store.items.filter(i => !i.checked) };
}

export function uncheckAll(store: GroceryStore): GroceryStore {
  return { ...store, items: store.items.map(i => ({ ...i, checked: false })) };
}

// ── Saved Templates ───────────────────────────────────────────────────────────

export function saveTemplate(
  store: GroceryStore,
  item: GroceryItem,
): GroceryStore {
  // avoid duplicates by name (case-insensitive)
  const exists = store.saved.some(
    s => s.name.toLowerCase() === item.name.toLowerCase(),
  );
  if (exists) return store;
  const tpl: SavedTemplate = {
    id: uid(),
    name: item.name,
    section: item.section,
    qty: item.qty,
    unit: item.unit,
    brand: item.brand,
    estimatedPrice: item.estimatedPrice,
  };
  return { ...store, saved: [...store.saved, tpl] };
}

export function deleteTemplate(store: GroceryStore, id: string): GroceryStore {
  return { ...store, saved: store.saved.filter(s => s.id !== id) };
}

export function addFromTemplate(
  store: GroceryStore,
  tpl: SavedTemplate,
): GroceryStore {
  // skip if item with same name already in list
  if (store.items.some(i => i.name.toLowerCase() === tpl.name.toLowerCase())) {
    return store;
  }
  return addItem(store, {
    name: tpl.name,
    section: tpl.section,
    qty: tpl.qty,
    unit: tpl.unit,
    brand: tpl.brand,
    estimatedPrice: tpl.estimatedPrice,
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface GrocerySummary {
  total: number;
  checked: number;
  remaining: number;
  estimatedTotal: number;
  estimatedChecked: number;
}

export function computeSummary(items: GroceryItem[]): GrocerySummary {
  const checked = items.filter(i => i.checked);
  const estimatedTotal = items.reduce((s, i) => s + (i.estimatedPrice ?? 0) * i.qty, 0);
  const estimatedChecked = checked.reduce((s, i) => {
    const price = i.actualPrice ?? i.estimatedPrice ?? 0;
    return s + price * i.qty;
  }, 0);
  return {
    total: items.length,
    checked: checked.length,
    remaining: items.length - checked.length,
    estimatedTotal,
    estimatedChecked,
  };
}

export function groupBySection(
  items: GroceryItem[],
): Map<StoreSection, GroceryItem[]> {
  const map = new Map<StoreSection, GroceryItem[]>();
  for (const item of items) {
    const arr = map.get(item.section) ?? [];
    arr.push(item);
    map.set(item.section, arr);
  }
  return map;
}

// ── Export ────────────────────────────────────────────────────────────────────

export function exportAsText(store: GroceryStore): string {
  const grouped = groupBySection(store.items.filter(i => !i.checked));
  const lines: string[] = [`${store.listName}`, '─'.repeat(30)];
  for (const [section, items] of grouped) {
    lines.push(`\n${SECTION_EMOJI[section]} ${section}`);
    for (const item of items) {
      const price = item.estimatedPrice
        ? ` (~₹${item.estimatedPrice * item.qty})`
        : '';
      lines.push(`  • ${item.name} — ${item.qty} ${item.unit}${price}`);
    }
  }
  return lines.join('\n');
}