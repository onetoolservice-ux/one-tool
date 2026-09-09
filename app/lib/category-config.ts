// ─────────────────────────────────────────────────────────────────────────────
// category-config.ts — single source of truth for the 2 workspaces (My Finance, My Business)
//
// Every icon, color, emoji lives here.
// To change a category's color or icon: edit here only.
// ─────────────────────────────────────────────────────────────────────────────

import type { ElementType } from 'react';
import { TrendingUp, Store, LayoutGrid } from 'lucide-react';

export type CategoryMeta = {
  /** Exact display label — must match the category field in tools-data */
  label: string;
  /** Emoji used in compact displays and breadcrumbs */
  emoji: string;
  /** Lucide icon component */
  Icon: ElementType;
  // ── Sidebar / CategoryNav ────────────────────────────────────────────────
  /** bg + text classes for the icon circle (active state) */
  iconCircle: string;
  /** bg + text classes for the active row in the sidebar */
  activeItem: string;
  /** bg + text classes for the active pill on mobile */
  activeChip: string;
  // ── Section header in tool-grid ──────────────────────────────────────────
  sectionIconBg: string;
  sectionIconText: string;
  sectionText: string;
  /** Leading gradient classes for the section divider line */
  sectionLine: string;
  /** bg + text for the tool-count badge */
  sectionCount: string;
  // ── ToolCard left edge ───────────────────────────────────────────────────
  /** "from-X to-Y" gradient for the colored left border on ToolCard */
  topEdge: string;
};

const CONFIG: CategoryMeta[] = [
  {
    label: 'My Finance',
    emoji: '📊',
    Icon: TrendingUp,
    iconCircle: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    activeItem: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    activeChip: 'bg-emerald-600 text-white',
    sectionIconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    sectionIconText: 'text-emerald-600 dark:text-emerald-400',
    sectionText: 'text-emerald-700 dark:text-emerald-300',
    sectionLine: 'from-emerald-300/60 dark:from-emerald-700/60',
    sectionCount: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    topEdge: 'from-emerald-500 to-teal-400',
  },
  {
    label: 'My Business',
    emoji: '🏪',
    Icon: Store,
    iconCircle: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    activeItem: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
    activeChip: 'bg-blue-600 text-white',
    sectionIconBg: 'bg-blue-100 dark:bg-blue-500/15',
    sectionIconText: 'text-blue-600 dark:text-blue-400',
    sectionText: 'text-blue-700 dark:text-blue-300',
    sectionLine: 'from-blue-300/60 dark:from-blue-700/60',
    sectionCount: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
    topEdge: 'from-blue-600 to-indigo-500',
  },
];

// ── Lookups ───────────────────────────────────────────────────────────────────

const META_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CONFIG.map(c => [c.label, c])
);

const FALLBACK: CategoryMeta = {
  label: 'Other',
  emoji: '📦',
  Icon: LayoutGrid,
  iconCircle: 'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-400',
  activeItem: 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300',
  activeChip: 'bg-slate-500 text-white',
  sectionIconBg: 'bg-slate-100 dark:bg-slate-500/15',
  sectionIconText: 'text-slate-500 dark:text-slate-400',
  sectionText: 'text-slate-600 dark:text-slate-400',
  sectionLine: 'from-slate-300/60 dark:from-slate-700/60',
  sectionCount: 'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-400',
  topEdge: 'from-slate-400 to-slate-300',
};

/**
 * Get metadata for a category by label (case-insensitive).
 * Returns a fallback for unknown categories so nothing crashes.
 */
export function getCategoryMeta(category: string): CategoryMeta {
  if (META_MAP[category]) return META_MAP[category];
  const lower = category.toLowerCase();
  return CONFIG.find(c => c.label.toLowerCase() === lower) ?? FALLBACK;
}

/** Emoji shortcut — avoids importing the full meta when only the emoji is needed */
export function getCategoryEmoji(category: string): string {
  return getCategoryMeta(category).emoji;
}
