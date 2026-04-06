'use client';

import React, { useState, useEffect } from 'react';
import { CATEGORY_ORDER, ALL_TOOLS } from '@/app/lib/tools-data';
import { getCategoryMeta, ALL_CATEGORY_META } from '@/app/lib/category-config';
import { LayoutGrid, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface CategoryNavProps {
  active: string;
  onChange: (category: string) => void;
}

const ALL_ENTRY = {
  id: 'all',
  label: 'All',
  count: ALL_TOOLS.length,
};

const CATEGORIES = [
  ALL_ENTRY,
  ...CATEGORY_ORDER.map(cat => ({
    id: cat.toLowerCase(),
    label: cat,
    count: ALL_TOOLS.filter(t => t.category === cat).length,
  })),
];

const STORAGE_KEY = 'onetool-sidebar-collapsed';

export default function CategoryNav({ active, onChange }: CategoryNavProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <>
      {/* ── MOBILE: horizontal scroll strip ─────────────────────────────── */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-2 py-1.5 scrollbar-none bg-white dark:bg-[#0F111A] border-b border-slate-200/60 dark:border-white/[0.06]">
        {CATEGORIES.map(cat => {
          const isActive = active === cat.id;
          const meta = cat.id === 'all' ? null : getCategoryMeta(cat.label);
          const Icon = meta ? meta.Icon : LayoutGrid;

          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                whitespace-nowrap transition-all duration-150 flex-shrink-0
                ${isActive
                  ? (meta ? meta.activeChip : 'bg-indigo-600 text-white') + ' shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }
              `}
            >
              <Icon size={12} />
              <span>{cat.label}</span>
              <span className={`text-[9px] font-bold tabular-nums ${isActive ? 'opacity-70' : 'text-slate-400 dark:text-slate-500'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── DESKTOP: vertical sidebar ───────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0
          border-r border-slate-200/50 dark:border-white/[0.05]
          bg-white dark:bg-[#0d0f1a]
          transition-[width] duration-200 ease-in-out overflow-hidden
          ${collapsed ? 'w-[54px]' : 'w-[210px]'}
        `}
        style={{ height: 'calc(100vh - 56px)', position: 'sticky', top: 56 }}
      >
        {/* Category list */}
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 scrollbar-none" aria-label="Tool categories">
          <div className="space-y-0.5">
            {CATEGORIES.map(cat => {
              const isActive = active === cat.id;
              const meta = cat.id === 'all' ? null : getCategoryMeta(cat.label);
              const Icon = meta ? meta.Icon : LayoutGrid;

              const iconCircle = meta ? meta.iconCircle : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400';
              const activeItem = meta ? meta.activeItem : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300';

              return (
                <button
                  key={cat.id}
                  onClick={() => onChange(cat.id)}
                  title={collapsed ? `${cat.label} (${cat.count})` : undefined}
                  aria-label={`Filter by ${cat.label}`}
                  aria-pressed={isActive}
                  className={`
                    w-full flex items-center rounded-lg transition-all duration-150 group relative
                    ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-[6px]'}
                    ${isActive
                      ? `${activeItem} font-semibold`
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-700 dark:hover:text-slate-300'
                    }
                  `}
                >
                  {/* Icon circle */}
                  <div className={`
                    flex items-center justify-center rounded-lg flex-shrink-0 transition-colors
                    ${collapsed ? 'w-8 h-8' : 'w-7 h-7'}
                    ${isActive
                      ? iconCircle
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'
                    }
                  `}>
                    <Icon size={collapsed ? 15 : 13} />
                  </div>

                  {!collapsed && (
                    <>
                      <span className="text-[13px] leading-tight truncate flex-1 text-left">{cat.label}</span>
                      <span className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        isActive
                          ? 'bg-white/60 dark:bg-white/10'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-400 dark:text-slate-500'
                      }`}>
                        {cat.count}
                      </span>
                    </>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                      {cat.label}
                      <span className="ml-1.5 text-slate-400 font-mono text-[10px]">{cat.count}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-slate-100 dark:border-white/[0.04] p-1.5">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            {!collapsed && <span className="text-[11px] font-medium">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
