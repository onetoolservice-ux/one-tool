'use client';

import React from 'react';
import { CATEGORY_ORDER, ALL_TOOLS } from '@/app/lib/tools-data';
import { getCategoryMeta } from '@/app/lib/category-config';
import { LayoutGrid } from 'lucide-react';

interface CategoryNavProps {
  active: string;
  onChange: (category: string) => void;
  /** If true, renders only the mobile horizontal strip (used for mobile overlay) */
  mobileOnly?: boolean;
}

const ALL_ENTRY = { id: 'all', label: 'All Tools', count: ALL_TOOLS.length };

const CATEGORIES = [
  ALL_ENTRY,
  ...CATEGORY_ORDER.map(cat => ({
    id: cat.toLowerCase(),
    label: cat,
    count: ALL_TOOLS.filter(t => t.category === cat).length,
  })),
];

export default function CategoryNav({ active, onChange, mobileOnly = false }: CategoryNavProps) {

  const categoryButtons = CATEGORIES.map(cat => {
    const isActive = active === cat.id;
    const meta = cat.id === 'all' ? null : getCategoryMeta(cat.label);
    const Icon = meta?.Icon ?? LayoutGrid;
    return { cat, isActive, meta, Icon };
  });

  if (mobileOnly) {
    /* ── MOBILE: horizontal scroll strip ─────────────────────────────── */
    return (
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 scrollbar-none bg-white dark:bg-[#0F111A] border-b border-slate-200 dark:border-white/[0.06]">
        {categoryButtons.map(({ cat, isActive, meta, Icon }) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium
              whitespace-nowrap transition-all duration-150 flex-shrink-0
              ${isActive
                ? (meta?.activeChip ?? 'bg-[var(--ot-accent,#6366f1)] text-white') + ' shadow-sm'
                : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.09]'
              }
            `}
          >
            <Icon size={11} />
            <span>{cat.label}</span>
            <span className={`text-[9px] font-bold tabular-nums ${isActive ? 'opacity-75' : 'text-slate-400 dark:text-slate-500'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>
    );
  }

  /* ── DESKTOP: vertical list (parent handles the aside/width) ────────── */
  return (
    <nav className="flex-1 overflow-y-auto py-1 px-2 scrollbar-none" aria-label="Tool categories">
      <div className="space-y-0.5">
        {categoryButtons.map(({ cat, isActive, meta, Icon }) => {
          const iconCircle = meta?.iconCircle ?? 'bg-[var(--ot-accent,#6366f1)]/10 text-[var(--ot-accent,#6366f1)]';
          const activeItem = meta?.activeItem ?? 'bg-[var(--ot-accent,#6366f1)]/8 text-[var(--ot-accent,#6366f1)]';

          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              aria-label={`Filter by ${cat.label}`}
              aria-pressed={isActive}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-1.5
                rounded-lg transition-all duration-150 group
                ${isActive
                  ? `${activeItem} font-semibold`
                  : 'text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }
              `}
            >
              <div className={`
                w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 transition-colors
                ${isActive
                  ? iconCircle
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/[0.09]'
                }
              `}>
                <Icon size={12} />
              </div>

              <span className="text-[12px] font-normal leading-tight truncate flex-1 text-left">
                {cat.label}
              </span>

              <span className={`
                text-[10px] font-normal tabular-nums px-1.5 py-0.5 rounded-full flex-shrink-0
                ${isActive
                  ? 'bg-white/70 dark:bg-white/10 text-inherit'
                  : 'text-slate-900 dark:text-white opacity-40'
                }
              `}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
