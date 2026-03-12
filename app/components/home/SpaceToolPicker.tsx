'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Check, Pin } from 'lucide-react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { addPin, removePin, getPinsForSpace } from '@/app/lib/home-store';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { getTheme } from '@/app/lib/theme-config';

const TOOL_ICON_BG: Record<string, string> = {
  'biz-dashboard':         'bg-gradient-to-br from-blue-600 to-indigo-600',
  'biz-daybook':           'bg-gradient-to-br from-emerald-500 to-teal-600',
  'biz-parties':           'bg-gradient-to-br from-violet-500 to-purple-600',
  'biz-invoices':          'bg-gradient-to-br from-amber-500 to-orange-500',
  'biz-products':          'bg-gradient-to-br from-cyan-500 to-blue-500',
  'biz-inventory':         'bg-gradient-to-br from-teal-500 to-emerald-500',
  'biz-reports':           'bg-gradient-to-br from-indigo-500 to-blue-600',
  'biz-outstanding':       'bg-gradient-to-br from-rose-500 to-red-600',
  'pf-statement-manager':  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'pf-expenses':           'bg-gradient-to-br from-red-500 to-rose-600',
  'pf-cash-flow':          'bg-gradient-to-br from-teal-500 to-cyan-500',
  'pf-ai-analyst':         'bg-gradient-to-br from-violet-600 to-fuchsia-500',
  'gst-calculator':        'bg-gradient-to-br from-orange-500 to-amber-600',
  'smart-budget':          'bg-gradient-to-br from-emerald-500 to-teal-600',
  'smart-loan':            'bg-gradient-to-br from-green-600 to-emerald-500',
  'dev-station':           'bg-gradient-to-br from-violet-600 to-purple-700',
  'smart-pdf-merge':       'bg-gradient-to-br from-red-600 to-rose-500',
  'smart-json':            'bg-gradient-to-br from-orange-500 to-amber-500',
  'smart-bmi':             'bg-gradient-to-br from-teal-500 to-cyan-600',
  'life-os':               'bg-gradient-to-br from-rose-500 to-pink-600',
  'qr-code':               'bg-gradient-to-br from-slate-700 to-slate-900',
  'color-picker':          'bg-gradient-to-br from-pink-500 to-rose-600',
  'prompt-generator':      'bg-gradient-to-br from-fuchsia-500 to-purple-600',
};

interface Props {
  spaceId: string;
  spaceName: string;
  onClose: () => void;
}

export function SpaceToolPicker({ spaceId, spaceName, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [pins, setPins] = useState<string[]>([]);

  useEffect(() => {
    setPins(getPinsForSpace(spaceId));
    const refresh = () => setPins(getPinsForSpace(spaceId));
    window.addEventListener('onetool-home-updated', refresh);
    return () => window.removeEventListener('onetool-home-updated', refresh);
  }, [spaceId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_TOOLS;
    const q = query.toLowerCase();
    return ALL_TOOLS.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      ((t as any).desc || '').toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (toolId: string) => {
    if (pins.includes(toolId)) {
      removePin(toolId, spaceId);
    } else {
      addPin(toolId, spaceId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[70vh] flex flex-col bg-white dark:bg-[#151827] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Pin size={15} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Add tools to <span className="text-indigo-600 dark:text-indigo-400">{spaceName}</span>
            </h2>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              {pins.length} pinned
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search 158 tools…"
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Tool list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 grid grid-cols-2 sm:grid-cols-3 gap-2 content-start">
          {filtered.map(tool => {
            const isPinned = pins.includes(tool.id);
            const theme = getTheme(tool.category);
            const IconComponent = typeof tool.icon === 'string'
              ? getIconComponent(tool.icon as IconName)
              : null;
            const iconBg = TOOL_ICON_BG[tool.id] ?? theme.iconBg;

            return (
              <button
                key={tool.id}
                onClick={() => toggle(tool.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isPinned
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/40'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className={`w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center text-white ${iconBg}`}>
                  {IconComponent ? <IconComponent size={14} /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">
                    {tool.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {tool.category}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border transition-all ${
                  isPinned
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-slate-300 dark:border-white/20'
                }`}>
                  {isPinned && <Check size={9} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-400">{filtered.length} tools shown</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
