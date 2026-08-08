// ─────────────────────────────────────────────────────────────────────────────
// category-config.ts — single source of truth for all 22 categories
//
// Every icon, color, emoji lives here.
// CategoryNav, ToolCard, tool-grid, and LandingPage all import from this file.
// To change a category's color or icon: edit here only.
// ─────────────────────────────────────────────────────────────────────────────

import type { ElementType } from 'react';
import {
  TrendingUp, Wallet, Receipt, Store, Briefcase, Terminal,
  Zap, FileText, Heart, Target, User, Home, Rocket, Globe,
  Users, UserCheck, ArrowRightLeft, Palette, Sparkles, Video,
  PenLine, ShoppingBag, LayoutGrid, Clock, Star,
} from 'lucide-react';

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
    label: 'Personal Finance',
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
    label: 'Finance',
    emoji: '💰',
    Icon: Wallet,
    iconCircle: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    activeItem: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    activeChip: 'bg-cyan-600 text-white',
    sectionIconBg: 'bg-cyan-100 dark:bg-cyan-500/15',
    sectionIconText: 'text-cyan-600 dark:text-cyan-400',
    sectionText: 'text-cyan-700 dark:text-cyan-300',
    sectionLine: 'from-cyan-300/60 dark:from-cyan-700/60',
    sectionCount: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    topEdge: 'from-cyan-500 to-blue-400',
  },
  {
    label: 'GST & Tax',
    emoji: '🧾',
    Icon: Receipt,
    iconCircle: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    activeItem: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300',
    activeChip: 'bg-orange-600 text-white',
    sectionIconBg: 'bg-orange-100 dark:bg-orange-500/15',
    sectionIconText: 'text-orange-600 dark:text-orange-400',
    sectionText: 'text-orange-700 dark:text-orange-300',
    sectionLine: 'from-orange-300/60 dark:from-orange-700/60',
    sectionCount: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    topEdge: 'from-orange-500 to-amber-400',
  },
  {
    label: 'Business OS',
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
  {
    label: 'Business',
    emoji: '💼',
    Icon: Briefcase,
    iconCircle: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    activeItem: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    activeChip: 'bg-indigo-600 text-white',
    sectionIconBg: 'bg-indigo-100 dark:bg-indigo-500/15',
    sectionIconText: 'text-indigo-600 dark:text-indigo-400',
    sectionText: 'text-indigo-700 dark:text-indigo-300',
    sectionLine: 'from-indigo-300/60 dark:from-indigo-700/60',
    sectionCount: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    topEdge: 'from-indigo-500 to-violet-400',
  },
  {
    label: 'Developer',
    emoji: '⌨️',
    Icon: Terminal,
    iconCircle: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    activeItem: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300',
    activeChip: 'bg-violet-600 text-white',
    sectionIconBg: 'bg-violet-100 dark:bg-violet-500/15',
    sectionIconText: 'text-violet-600 dark:text-violet-400',
    sectionText: 'text-violet-700 dark:text-violet-300',
    sectionLine: 'from-violet-300/60 dark:from-violet-700/60',
    sectionCount: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    topEdge: 'from-violet-600 to-purple-500',
  },
  {
    label: 'Productivity',
    emoji: '⚡',
    Icon: Zap,
    iconCircle: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    activeItem: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300',
    activeChip: 'bg-sky-600 text-white',
    sectionIconBg: 'bg-sky-100 dark:bg-sky-500/15',
    sectionIconText: 'text-sky-600 dark:text-sky-400',
    sectionText: 'text-sky-700 dark:text-sky-300',
    sectionLine: 'from-sky-300/60 dark:from-sky-700/60',
    sectionCount: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
    topEdge: 'from-sky-500 to-blue-400',
  },
  {
    label: 'Documents',
    emoji: '📄',
    Icon: FileText,
    iconCircle: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    activeItem: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
    activeChip: 'bg-amber-600 text-white',
    sectionIconBg: 'bg-amber-100 dark:bg-amber-500/15',
    sectionIconText: 'text-amber-600 dark:text-amber-400',
    sectionText: 'text-amber-700 dark:text-amber-300',
    sectionLine: 'from-amber-300/60 dark:from-amber-700/60',
    sectionCount: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    topEdge: 'from-amber-500 to-yellow-400',
  },
  {
    label: 'Health',
    emoji: '❤️',
    Icon: Heart,
    iconCircle: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
    activeItem: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300',
    activeChip: 'bg-teal-600 text-white',
    sectionIconBg: 'bg-teal-100 dark:bg-teal-500/15',
    sectionIconText: 'text-teal-600 dark:text-teal-400',
    sectionText: 'text-teal-700 dark:text-teal-300',
    sectionLine: 'from-teal-300/60 dark:from-teal-700/60',
    sectionCount: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400',
    topEdge: 'from-teal-500 to-cyan-400',
  },
  {
    label: 'Career',
    emoji: '🎯',
    Icon: Target,
    iconCircle: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    activeItem: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
    activeChip: 'bg-rose-600 text-white',
    sectionIconBg: 'bg-rose-100 dark:bg-rose-500/15',
    sectionIconText: 'text-rose-600 dark:text-rose-400',
    sectionText: 'text-rose-700 dark:text-rose-300',
    sectionLine: 'from-rose-300/60 dark:from-rose-700/60',
    sectionCount: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    topEdge: 'from-rose-500 to-pink-400',
  },
  {
    label: 'Bio Data & Resume',
    emoji: '📋',
    Icon: User,
    iconCircle: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
    activeItem: 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-300',
    activeChip: 'bg-slate-600 text-white',
    sectionIconBg: 'bg-slate-100 dark:bg-slate-500/15',
    sectionIconText: 'text-slate-600 dark:text-slate-400',
    sectionText: 'text-slate-700 dark:text-slate-300',
    sectionLine: 'from-slate-300/60 dark:from-slate-700/60',
    sectionCount: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
    topEdge: 'from-slate-500 to-gray-400',
  },
  {
    label: 'Real Estate',
    emoji: '🏠',
    Icon: Home,
    iconCircle: 'bg-lime-100 text-lime-600 dark:bg-lime-500/15 dark:text-lime-400',
    activeItem: 'bg-lime-50 dark:bg-lime-500/10 text-lime-700 dark:text-lime-300',
    activeChip: 'bg-lime-600 text-white',
    sectionIconBg: 'bg-lime-100 dark:bg-lime-500/15',
    sectionIconText: 'text-lime-600 dark:text-lime-400',
    sectionText: 'text-lime-700 dark:text-lime-300',
    sectionLine: 'from-lime-300/60 dark:from-lime-700/60',
    sectionCount: 'bg-lime-100 text-lime-600 dark:bg-lime-500/15 dark:text-lime-400',
    topEdge: 'from-lime-500 to-green-400',
  },
  {
    label: 'Startup',
    emoji: '🚀',
    Icon: Rocket,
    iconCircle: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    activeItem: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300',
    activeChip: 'bg-red-600 text-white',
    sectionIconBg: 'bg-red-100 dark:bg-red-500/15',
    sectionIconText: 'text-red-600 dark:text-red-400',
    sectionText: 'text-red-700 dark:text-red-300',
    sectionLine: 'from-red-300/60 dark:from-red-700/60',
    sectionCount: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
    topEdge: 'from-red-500 to-orange-400',
  },
  {
    label: 'Travel',
    emoji: '✈️',
    Icon: Globe,
    iconCircle: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    activeItem: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-200',
    activeChip: 'bg-cyan-700 text-white',
    sectionIconBg: 'bg-cyan-100 dark:bg-cyan-500/15',
    sectionIconText: 'text-cyan-700 dark:text-cyan-300',
    sectionText: 'text-cyan-800 dark:text-cyan-200',
    sectionLine: 'from-cyan-400/60 dark:from-cyan-600/60',
    sectionCount: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    topEdge: 'from-cyan-600 to-sky-500',
  },
  {
    label: 'Personal CRM',
    emoji: '👥',
    Icon: Users,
    iconCircle: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    activeItem: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300',
    activeChip: 'bg-purple-600 text-white',
    sectionIconBg: 'bg-purple-100 dark:bg-purple-500/15',
    sectionIconText: 'text-purple-600 dark:text-purple-400',
    sectionText: 'text-purple-700 dark:text-purple-300',
    sectionLine: 'from-purple-300/60 dark:from-purple-700/60',
    sectionCount: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400',
    topEdge: 'from-purple-500 to-violet-400',
  },
  {
    label: 'Business CRM',
    emoji: '🤝',
    Icon: UserCheck,
    iconCircle: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
    activeItem: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300',
    activeChip: 'bg-pink-600 text-white',
    sectionIconBg: 'bg-pink-100 dark:bg-pink-500/15',
    sectionIconText: 'text-pink-600 dark:text-pink-400',
    sectionText: 'text-pink-700 dark:text-pink-300',
    sectionLine: 'from-pink-300/60 dark:from-pink-700/60',
    sectionCount: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400',
    topEdge: 'from-pink-500 to-rose-400',
  },
  {
    label: 'Converters',
    emoji: '🔄',
    Icon: ArrowRightLeft,
    iconCircle: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
    activeItem: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    activeChip: 'bg-yellow-600 text-white',
    sectionIconBg: 'bg-yellow-100 dark:bg-yellow-500/15',
    sectionIconText: 'text-yellow-600 dark:text-yellow-400',
    sectionText: 'text-yellow-700 dark:text-yellow-300',
    sectionLine: 'from-yellow-300/60 dark:from-yellow-700/60',
    sectionCount: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/15 dark:text-yellow-400',
    topEdge: 'from-yellow-500 to-amber-400',
  },
  {
    label: 'Design',
    emoji: '🎨',
    Icon: Palette,
    iconCircle: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400',
    activeItem: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    activeChip: 'bg-fuchsia-600 text-white',
    sectionIconBg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15',
    sectionIconText: 'text-fuchsia-600 dark:text-fuchsia-400',
    sectionText: 'text-fuchsia-700 dark:text-fuchsia-300',
    sectionLine: 'from-fuchsia-300/60 dark:from-fuchsia-700/60',
    sectionCount: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400',
    topEdge: 'from-fuchsia-500 to-pink-400',
  },
  {
    label: 'AI',
    emoji: '🤖',
    Icon: Sparkles,
    iconCircle: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    activeItem: 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-200',
    activeChip: 'bg-blue-700 text-white',
    sectionIconBg: 'bg-blue-100 dark:bg-blue-500/15',
    sectionIconText: 'text-blue-700 dark:text-blue-300',
    sectionText: 'text-blue-800 dark:text-blue-200',
    sectionLine: 'from-blue-400/60 dark:from-blue-600/60',
    sectionCount: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    topEdge: 'from-blue-700 to-violet-500',
  },
  {
    label: 'Creator',
    emoji: '🎬',
    Icon: Video,
    iconCircle: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    activeItem: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300',
    activeChip: 'bg-orange-600 text-white',
    sectionIconBg: 'bg-orange-100 dark:bg-orange-500/15',
    sectionIconText: 'text-orange-600 dark:text-orange-400',
    sectionText: 'text-orange-700 dark:text-orange-300',
    sectionLine: 'from-orange-300/60 dark:from-orange-700/60',
    sectionCount: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
    topEdge: 'from-orange-500 to-red-400',
  },
  {
    label: "Writer's OS",
    emoji: '✍️',
    Icon: PenLine,
    iconCircle: 'bg-stone-100 text-stone-600 dark:bg-stone-500/15 dark:text-stone-400',
    activeItem: 'bg-stone-50 dark:bg-stone-500/10 text-stone-700 dark:text-stone-300',
    activeChip: 'bg-stone-600 text-white',
    sectionIconBg: 'bg-stone-100 dark:bg-stone-500/15',
    sectionIconText: 'text-stone-600 dark:text-stone-400',
    sectionText: 'text-stone-700 dark:text-stone-300',
    sectionLine: 'from-stone-300/60 dark:from-stone-700/60',
    sectionCount: 'bg-stone-100 text-stone-600 dark:bg-stone-500/15 dark:text-stone-400',
    topEdge: 'from-stone-500 to-gray-400',
  },
  {
    label: 'Time Management',
    emoji: '⏱️',
    Icon: Clock,
    iconCircle: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    activeItem: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-200',
    activeChip: 'bg-indigo-700 text-white',
    sectionIconBg: 'bg-indigo-100 dark:bg-indigo-500/15',
    sectionIconText: 'text-indigo-700 dark:text-indigo-300',
    sectionText: 'text-indigo-800 dark:text-indigo-200',
    sectionLine: 'from-indigo-400/60 dark:from-indigo-600/60',
    sectionCount: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    topEdge: 'from-indigo-600 to-violet-500',
  },
  {
    label: 'Astrology',
    emoji: '🔮',
    Icon: Star,
    iconCircle: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    activeItem: 'bg-violet-50 dark:bg-violet-500/10 text-violet-800 dark:text-violet-200',
    activeChip: 'bg-violet-700 text-white',
    sectionIconBg: 'bg-violet-100 dark:bg-violet-500/15',
    sectionIconText: 'text-violet-700 dark:text-violet-300',
    sectionText: 'text-violet-800 dark:text-violet-200',
    sectionLine: 'from-violet-400/60 dark:from-violet-600/60',
    sectionCount: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    topEdge: 'from-violet-600 to-purple-500',
  },
  {
    label: 'Daily Utility',
    emoji: '🛒',
    Icon: ShoppingBag,
    iconCircle: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
    activeItem: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300',
    activeChip: 'bg-green-600 text-white',
    sectionIconBg: 'bg-green-100 dark:bg-green-500/15',
    sectionIconText: 'text-green-600 dark:text-green-400',
    sectionText: 'text-green-700 dark:text-green-300',
    sectionLine: 'from-green-300/60 dark:from-green-700/60',
    sectionCount: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400',
    topEdge: 'from-green-500 to-teal-400',
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
