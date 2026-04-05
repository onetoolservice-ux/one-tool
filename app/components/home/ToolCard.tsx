'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTheme } from '@/app/lib/theme-config';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { Star, Pin } from 'lucide-react';
import { isPinned, addPin, removePin } from '@/app/lib/home-store';
import { useToast } from '@/app/components/ui/toast-system';

// Per-tool unique icon gradients — single source of truth in tool-icon-bg.ts
import { TOOL_ICON_BG } from '@/app/lib/tool-icon-bg';

/* Category → colored top-edge accent for the card */
const CATEGORY_TOP_EDGE: Record<string, string> = {
  Analytics:    'from-blue-500 to-cyan-400',
  Finance:      'from-emerald-500 to-teal-400',
  Business:     'from-indigo-500 to-blue-400',
  Documents:    'from-amber-500 to-orange-400',
  Developer:    'from-indigo-600 to-blue-500',
  Productivity: 'from-rose-500 to-pink-400',
  Converters:   'from-cyan-500 to-sky-400',
  Design:       'from-pink-500 to-fuchsia-400',
  Health:       'from-teal-500 to-emerald-400',
  AI:           'from-pink-500 to-rose-400',
  Creator:      'from-orange-500 to-amber-400',
};

interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  href: string;
  icon_name?: string;
  color?: string;
  popular?: boolean;
  status?: string;
}

export function ToolCard({ tool }: { tool: Tool }) {
  const theme = getTheme(tool.category);
  const href = tool.href || `/tools/${tool.category.toLowerCase()}/${tool.id}`;
  const IconComponent = tool.icon_name
    ? getIconComponent(tool.icon_name as IconName)
    : null;
  const topEdge = CATEGORY_TOP_EDGE[tool.category] || 'from-slate-400 to-slate-300';

  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const { toast } = useToast();
  useEffect(() => { setMounted(true); setPinned(isPinned(tool.id)); }, [tool.id]);

  const togglePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pinned) {
      removePin(tool.id);
      setPinned(false);
      toast(`Removed "${tool.name}" from My Home`, 'info');
    } else {
      addPin(tool.id);
      setPinned(true);
      toast(`"${tool.name}" pinned to My Home`, 'success');
    }
  };

  return (
    <Link href={href} className="group relative block" aria-label={`Open ${tool.name} tool`} onMouseLeave={() => setDescExpanded(false)}>
      <article className="relative h-[108px] rounded-xl bg-white dark:bg-[#151827] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/25 flex flex-row overflow-hidden">
        {/* Colored left edge */}
        <div className={`w-[3px] min-h-full bg-gradient-to-b ${topEdge} opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0`} />

        <div className="px-3.5 pt-3 pb-3 flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl text-white shadow-sm transform group-hover:scale-105 transition-all duration-200 ${TOOL_ICON_BG[tool.id] ?? theme.iconBg}`}>
              {IconComponent ? <IconComponent size={18} /> : null}
            </div>
            <div className="flex items-center gap-1">
              {tool.popular && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star size={10} fill="currentColor" />
                </span>
              )}
              <button
                onClick={togglePin}
                title={pinned ? 'Remove from My Home' : 'Pin to My Home'}
                aria-label={mounted ? (pinned ? `Unpin ${tool.name} from My Home` : `Pin ${tool.name} to My Home`) : undefined}
                aria-pressed={mounted ? pinned : undefined}
                className={`p-1 rounded-md transition-all duration-150 ${
                  pinned
                    ? 'text-indigo-500 dark:text-indigo-400'
                    : 'text-slate-300 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
              >
                <Pin size={13} fill={pinned ? 'currentColor' : 'none'} strokeWidth={pinned ? 0 : 2} />
              </button>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
            {tool.name}
          </h3>
        </div>
      </article>

      {/* Tooltip — outside article so not clipped, appears below card */}
      {tool.description && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-500/20 rounded-xl px-3 py-2.5 shadow-lg">
            <p className={`text-[11px] leading-relaxed text-indigo-900 dark:text-indigo-200 ${descExpanded ? '' : 'line-clamp-2'}`}>
              {tool.description}
            </p>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setDescExpanded(v => !v); }}
              className="mt-1 text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {descExpanded ? 'Hide' : 'See more'}
            </button>
          </div>
        </div>
      )}
    </Link>
  );
}
