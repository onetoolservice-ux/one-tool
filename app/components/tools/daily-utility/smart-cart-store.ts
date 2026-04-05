'use client';
// ══════════════════════════════════════════════════════════════════════════════
// Smart Cart Store — Daily Utility tool
// Designed by Claude · Storage key: otsd-smart-cart
//
// A daily shopping & items tracker with Need/Want/Luxury classification,
// multi-list support, price history, and PF Budget Pulse integration.
// ══════════════════════════════════════════════════════════════════════════════

import { safeLocalStorage } from '@/app/lib/utils/storage';

export const SC_STORAGE_KEY = 'otsd-smart-cart';
export const SC_VERSION = 1;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ItemPriority = 'need' | 'want' | 'luxury';
export type ItemStatus   = 'pending' | 'bought' | 'skipped';
export type RecurringFreq = 'weekly' | 'biweekly' | 'monthly';

export const CART_ITEM_CATEGORIES = [
  'Grocery',
  'Fruits & Veg',
  'Dairy',
  'Meat & Fish',
  'Personal Care',
  'Medicine',
  'Household',
  'Cleaning',
  'Electronics',
  'Clothing',
  'Footwear',
  'Stationery',
  'Books',
  'Home & Kitchen',
  'Baby & Kids',
  'Pet Supplies',
  'Other',
] as const;

export type CartItemCategory = (typeof CART_ITEM_CATEGORIES)[number];

export const UNIT_OPTIONS = [
  'pcs', 'kg', 'g', 'liters', 'ml',
  'box', 'pack', 'dozen', 'pair', 'set', 'bottle', 'tube', 'other',
] as const;

export type ItemUnit = (typeof UNIT_OPTIONS)[number];

export const LIST_COLORS = [
  { key: 'green',  label: 'Green',  bg: 'bg-green-100 dark:bg-green-900/30',  text: 'text-green-700 dark:text-green-300',  dot: 'bg-green-500'  },
  { key: 'blue',   label: 'Blue',   bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300',    dot: 'bg-blue-500'   },
  { key: 'amber',  label: 'Amber',  bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-300',  dot: 'bg-amber-500'  },
  { key: 'purple', label: 'Purple', bg: 'bg-purple-100 dark:bg-purple-900/30',text: 'text-purple-700 dark:text-purple-300',dot: 'bg-purple-500' },
  { key: 'pink',   label: 'Pink',   bg: 'bg-pink-100 dark:bg-pink-900/30',    text: 'text-pink-700 dark:text-pink-300',    dot: 'bg-pink-500'   },
  { key: 'orange', label: 'Orange', bg: 'bg-orange-100 dark:bg-orange-900/30',text: 'text-orange-700 dark:text-orange-300',dot: 'bg-orange-500' },
  { key: 'rose',   label: 'Rose',   bg: 'bg-rose-100 dark:bg-rose-900/30',    text: 'text-rose-700 dark:text-rose-300',    dot: 'bg-rose-500'   },
  { key: 'teal',   label: 'Teal',   bg: 'bg-teal-100 dark:bg-teal-900/30',    text: 'text-teal-700 dark:text-teal-300',    dot: 'bg-teal-500'   },
] as const;

export type ListColorKey = (typeof LIST_COLORS)[number]['key'];

export interface CartList {
  id: string;
  name: string;
  emoji: string;
  color: ListColorKey;
  description?: string;
  isArchived: boolean;
  budget?: number;
  createdAt: string;
  dueDate?: string;
}

export interface CartItem {
  id: string;
  listId: string;
  name: string;
  category: CartItemCategory;
  priority: ItemPriority;
  quantity: number;
  unit: ItemUnit;
  estimatedPrice: number;
  actualPrice?: number;
  store?: string;
  notes?: string;
  status: ItemStatus;
  isRecurring: boolean;
  recurringFrequency?: RecurringFreq;
  addedAt: string;
  boughtAt?: string;
  sortOrder: number;
}

export interface SCStoreData {
  version: number;
  lists: CartList[];
  items: CartItem[];
  activeListId: string | null;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

function makeDefaultLists(): CartList[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sc-list-weekly',
      name: 'Weekly Grocery',
      emoji: '🛒',
      color: 'green',
      description: 'Recurring weekly grocery run',
      isArchived: false,
      createdAt: now,
    },
    {
      id: 'sc-list-wishlist',
      name: 'Wishlist',
      emoji: '⭐',
      color: 'amber',
      description: 'Things I want to buy someday',
      isArchived: false,
      createdAt: now,
    },
  ];
}

function makeDefault(): SCStoreData {
  return {
    version: SC_VERSION,
    lists: makeDefaultLists(),
    items: [],
    activeListId: 'sc-list-weekly',
  };
}

// ── Persistence ───────────────────────────────────────────────────────────────

export function loadSCStore(): SCStoreData {
  try {
    const raw = safeLocalStorage.getItem<SCStoreData>(SC_STORAGE_KEY);
    if (!raw || typeof raw !== 'object') return makeDefault();
    const def = makeDefault();
    return {
      version: raw.version ?? def.version,
      lists: Array.isArray(raw.lists) ? raw.lists : def.lists,
      items: Array.isArray(raw.items) ? raw.items : def.items,
      activeListId: raw.activeListId ?? def.activeListId,
    };
  } catch {
    return makeDefault();
  }
}

export function saveSCStore(data: SCStoreData): void {
  try {
    safeLocalStorage.setItem(SC_STORAGE_KEY, data);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sc-store-updated'));
    }
  } catch { /* ignore */ }
}

// ── List CRUD ─────────────────────────────────────────────────────────────────

export function addList(list: Omit<CartList, 'id' | 'createdAt'>): CartList {
  const store = loadSCStore();
  const newList: CartList = {
    ...list,
    id: `sc-list-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.lists.push(newList);
  store.activeListId = newList.id;
  saveSCStore(store);
  return newList;
}

export function updateList(id: string, updates: Partial<CartList>): void {
  const store = loadSCStore();
  const idx = store.lists.findIndex(l => l.id === id);
  if (idx >= 0) {
    store.lists[idx] = { ...store.lists[idx], ...updates };
    saveSCStore(store);
  }
}

export function deleteList(id: string): void {
  const store = loadSCStore();
  store.lists = store.lists.filter(l => l.id !== id);
  store.items = store.items.filter(i => i.listId !== id);
  if (store.activeListId === id) {
    store.activeListId = store.lists.find(l => !l.isArchived)?.id ?? null;
  }
  saveSCStore(store);
}

export function setActiveList(id: string): void {
  const store = loadSCStore();
  store.activeListId = id;
  saveSCStore(store);
}

export function cloneListRecurring(listId: string, newName: string): void {
  const store = loadSCStore();
  const srcList = store.lists.find(l => l.id === listId);
  if (!srcList) return;
  const recurringItems = store.items.filter(i => i.listId === listId && i.isRecurring);
  const newList: CartList = {
    ...srcList,
    id: `sc-list-${Date.now()}`,
    name: newName,
    createdAt: new Date().toISOString(),
    isArchived: false,
  };
  store.lists.push(newList);
  recurringItems.forEach((item, idx) => {
    store.items.push({
      ...item,
      id: `sc-item-${Date.now()}-${idx}`,
      listId: newList.id,
      status: 'pending',
      addedAt: new Date().toISOString(),
      boughtAt: undefined,
      actualPrice: undefined,
      sortOrder: idx,
    });
  });
  store.activeListId = newList.id;
  saveSCStore(store);
}

// ── Item CRUD ─────────────────────────────────────────────────────────────────

export function addItem(item: Omit<CartItem, 'id' | 'addedAt' | 'sortOrder'>): CartItem {
  const store = loadSCStore();
  const sortOrder = store.items.filter(i => i.listId === item.listId).length;
  const newItem: CartItem = {
    ...item,
    id: `sc-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    addedAt: new Date().toISOString(),
    sortOrder,
  };
  store.items.push(newItem);
  saveSCStore(store);
  return newItem;
}

export function updateItem(id: string, updates: Partial<CartItem>): void {
  const store = loadSCStore();
  const idx = store.items.findIndex(i => i.id === id);
  if (idx >= 0) {
    store.items[idx] = { ...store.items[idx], ...updates };
    saveSCStore(store);
  }
}

export function deleteItem(id: string): void {
  const store = loadSCStore();
  store.items = store.items.filter(i => i.id !== id);
  saveSCStore(store);
}

export function markBought(id: string, actualPrice?: number): void {
  updateItem(id, {
    status: 'bought',
    boughtAt: new Date().toISOString(),
    actualPrice: actualPrice !== undefined ? actualPrice : undefined,
  });
}

export function markPending(id: string): void {
  updateItem(id, { status: 'pending', boughtAt: undefined, actualPrice: undefined });
}

export function clearBought(listId: string): void {
  const store = loadSCStore();
  store.items = store.items.filter(i => !(i.listId === listId && i.status === 'bought'));
  saveSCStore(store);
}

export function clearSkipped(listId: string): void {
  const store = loadSCStore();
  store.items = store.items.filter(i => !(i.listId === listId && i.status === 'skipped'));
  saveSCStore(store);
}

// ── Computed helpers ──────────────────────────────────────────────────────────

export interface CartSummary {
  total: number;
  pending: number;
  bought: number;
  skipped: number;
  needTotal: number;
  wantTotal: number;
  luxuryTotal: number;
  needCount: number;
  wantCount: number;
  luxuryCount: number;
  estimatedTotal: number;
  actualTotal: number;
  savings: number; // estimated - actual (positive = saved money)
}

export function computeSummary(items: CartItem[]): CartSummary {
  const pending  = items.filter(i => i.status === 'pending');
  const bought   = items.filter(i => i.status === 'bought');
  const skipped  = items.filter(i => i.status === 'skipped');

  const needItems    = items.filter(i => i.priority === 'need'    && i.status !== 'skipped');
  const wantItems    = items.filter(i => i.priority === 'want'    && i.status !== 'skipped');
  const luxuryItems  = items.filter(i => i.priority === 'luxury'  && i.status !== 'skipped');

  const estimatedTotal = items.filter(i => i.status !== 'skipped')
    .reduce((s, i) => s + (i.estimatedPrice * i.quantity), 0);
  const actualTotal = bought.reduce((s, i) => s + ((i.actualPrice ?? i.estimatedPrice) * i.quantity), 0);

  return {
    total:         items.length,
    pending:       pending.length,
    bought:        bought.length,
    skipped:       skipped.length,
    needTotal:     needItems.reduce((s, i)   => s + (i.estimatedPrice * i.quantity), 0),
    wantTotal:     wantItems.reduce((s, i)   => s + (i.estimatedPrice * i.quantity), 0),
    luxuryTotal:   luxuryItems.reduce((s, i) => s + (i.estimatedPrice * i.quantity), 0),
    needCount:     needItems.length,
    wantCount:     wantItems.length,
    luxuryCount:   luxuryItems.length,
    estimatedTotal,
    actualTotal,
    savings:       estimatedTotal - actualTotal,
  };
}

export interface CategoryGroup {
  category: CartItemCategory;
  items: CartItem[];
  estimatedTotal: number;
}

export function groupByCategory(items: CartItem[]): CategoryGroup[] {
  const map = new Map<CartItemCategory, CartItem[]>();
  items.forEach(item => {
    const arr = map.get(item.category) ?? [];
    arr.push(item);
    map.set(item.category, arr);
  });
  return Array.from(map.entries())
    .map(([category, catItems]) => ({
      category,
      items: catItems.sort((a, b) => a.sortOrder - b.sortOrder),
      estimatedTotal: catItems.reduce((s, i) => s + (i.estimatedPrice * i.quantity), 0),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function fmtPrice(n: number): string {
  if (n === 0) return '₹0';
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export const PRIORITY_META: Record<ItemPriority, { label: string; color: string; dot: string; bg: string }> = {
  need:    { label: 'Need',    color: 'text-rose-600 dark:text-rose-400',     dot: 'bg-rose-500',     bg: 'bg-rose-50 dark:bg-rose-900/20'    },
  want:    { label: 'Want',    color: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20'  },
  luxury:  { label: 'Luxury',  color: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
};

export const STATUS_META: Record<ItemStatus, { label: string; icon: string }> = {
  pending: { label: 'Pending', icon: '○' },
  bought:  { label: 'Bought',  icon: '✓' },
  skipped: { label: 'Skipped', icon: '—' },
};

export const CATEGORY_EMOJI: Partial<Record<CartItemCategory, string>> = {
  'Grocery':       '🛒',
  'Fruits & Veg':  '🥦',
  'Dairy':         '🥛',
  'Meat & Fish':   '🥩',
  'Personal Care': '🧴',
  'Medicine':      '💊',
  'Household':     '🏠',
  'Cleaning':      '🧹',
  'Electronics':   '📱',
  'Clothing':      '👕',
  'Footwear':      '👟',
  'Stationery':    '📝',
  'Books':         '📚',
  'Home & Kitchen':'🍳',
  'Baby & Kids':   '🍼',
  'Pet Supplies':  '🐾',
  'Other':         '📦',
};
