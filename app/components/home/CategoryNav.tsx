'use client';

import React, { useState, useEffect } from 'react';
import { CATEGORY_ORDER, ALL_TOOLS } from '@/app/lib/tools-data';
import {
  LayoutGrid, BarChart3, Wallet, Briefcase, FileText,
  Terminal, Zap, ArrowRightLeft, Palette, Heart, Brain, Mic,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

interface CategoryNavProps {
  active: string;
  onChange: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: LayoutGrid, analytics: BarChart3, finance: Wallet,
  business: Briefcase, documents: FileText, developer: Terminal,
  productivity: Zap, converters: ArrowRightLeft, design: Palette,
  health: Heart, ai: Brain, creator: Mic,
};

/* Each category gets a unique accent for the icon circle + active pill */
const CATEGORY_ACCENT: Record<string, { icon: string; active: string; chip: string }> = {
  all:          { icon: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400', active: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300', chip: 'bg-indigo-600 text-white' },
  analytics:    { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', active: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300', chip: 'bg-blue-600 text-white' },
  finance:      { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', chip: 'bg-emerald-600 text-white' },
  business:     { icon: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', active: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300', chip: 'bg-violet-600 text-white' },
  documents:    { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', active: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300', chip: 'bg-amber-600 text-white' },
  developer:    { icon: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400', active: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300', chip: 'bg-purple-600 text-white' },
  productivity: { icon: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', active: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300', chip: 'bg-rose-600 text-white' },
  converters:   { icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400', active: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300', chip: 'bg-cyan-600 text-white' },
  design:       { icon: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400', active: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300', chip: 'bg-pink-600 text-white' },
  health:       { icon: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400', active: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300', chip: 'bg-teal-600 text-white' },
  ai:           { icon: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400', active: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300', chip: 'bg-fuchsia-600 text-white' },
  creator:      { icon: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400', active: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300', chip: 'bg-orange-600 text-white' },
};

const CATEGORIES = [
  { id: 'all', label: 'All', count: ALL_TOOLS.length },
  ...CATEGORY_ORDER.map(cat => ({
    id: cat.toLowerCase(),
    label: cat,
    count: ALL_TOOLS.filter(t => t.category === cat).length,
  }))
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
          const Icon = CATEGORY_ICONS[cat.id] || LayoutGrid;
          const accent = CATEGORY_ACCENT[cat.id] || CATEGORY_ACCENT.all;

          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium
                whitespace-nowrap transition-all duration-150 flex-shrink-0
                ${isActive
                  ? `${accent.chip} shadow-sm`
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                }
              `}
            >
              <Icon size={12} />
              <span>{cat.label}</span>
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
        <nav className="flex-1 overflow-y-auto py-2 px-1.5 scrollbar-none">
          <div className="space-y-0.5">
            {CATEGORIES.map(cat => {
              const isActive = active === cat.id;
              const Icon = CATEGORY_ICONS[cat.id] || LayoutGrid;
              const accent = CATEGORY_ACCENT[cat.id] || CATEGORY_ACCENT.all;

              return (
                <button
                  key={cat.id}
                  onClick={() => onChange(cat.id)}
                  title={collapsed ? `${cat.label} (${cat.count})` : undefined}
                  className={`
                    w-full flex items-center rounded-lg transition-all duration-150 group relative
                    ${collapsed ? 'justify-center p-2' : 'gap-2.5 px-2 py-[6px]'}
                    ${isActive
                      ? `${accent.active} font-semibold`
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-700 dark:hover:text-slate-300'
                    }
                  `}
                >
                  {/* Icon circle */}
                  <div className={`
                    flex items-center justify-center rounded-lg flex-shrink-0 transition-colors
                    ${collapsed ? 'w-8 h-8' : 'w-7 h-7'}
                    ${isActive ? accent.icon : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'}
                  `}>
                    <Icon size={collapsed ? 15 : 13} />
                  </div>

                  {!collapsed && (
                    <>
                      <span className="text-[13px] leading-tight truncate">{cat.label}</span>
                      <span className={`ml-auto text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full ${
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
