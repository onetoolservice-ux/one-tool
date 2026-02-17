'use client';

import React from 'react';
import Link from 'next/link';
import { getTheme } from '@/app/lib/theme-config';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { Star } from 'lucide-react';

// Per-tool unique icon gradients — overrides the category-wide default
const TOOL_ICON_BG: Record<string, string> = {
  // Analytics
  analyticsreport:               'bg-gradient-to-br from-blue-600 to-cyan-500',
  managetransaction:             'bg-gradient-to-br from-indigo-600 to-blue-500',
  expenses:                      'bg-gradient-to-br from-rose-500 to-red-600',
  credits:                       'bg-gradient-to-br from-emerald-500 to-green-600',
  'self-serve-analytics':        'bg-gradient-to-br from-violet-600 to-indigo-500',
  'autonomous-financial-analyst':'bg-gradient-to-br from-purple-600 to-fuchsia-500',
  // Finance
  'smart-budget':    'bg-gradient-to-br from-emerald-500 to-teal-600',
  'smart-loan':      'bg-gradient-to-br from-green-600 to-emerald-500',
  'smart-sip':       'bg-gradient-to-br from-lime-500 to-green-600',
  'smart-net-worth': 'bg-gradient-to-br from-sky-500 to-blue-600',
  'smart-retirement':'bg-gradient-to-br from-blue-600 to-indigo-500',
  'gst-calculator':  'bg-gradient-to-br from-orange-500 to-amber-600',
  // Business
  'invoice-generator':'bg-gradient-to-br from-blue-600 to-blue-800',
  'salary-slip':      'bg-gradient-to-br from-violet-600 to-purple-700',
  'smart-agreement':  'bg-gradient-to-br from-slate-600 to-slate-900',
  'id-card':          'bg-gradient-to-br from-cyan-500 to-teal-600',
  'rent-receipt':     'bg-gradient-to-br from-teal-500 to-emerald-600',
  // Documents
  'universal-converter':'bg-gradient-to-br from-amber-500 to-orange-600',
  'smart-scan':        'bg-gradient-to-br from-blue-500 to-cyan-500',
  'smart-pdf-merge':   'bg-gradient-to-br from-red-600 to-rose-500',
  'smart-pdf-split':   'bg-gradient-to-br from-rose-500 to-pink-600',
  'smart-img-compress':'bg-gradient-to-br from-pink-500 to-rose-500',
  'smart-img-convert': 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
  'smart-ocr':         'bg-gradient-to-br from-violet-600 to-indigo-600',
  'smart-word':        'bg-gradient-to-br from-slate-600 to-slate-800',
  'smart-excel':       'bg-gradient-to-br from-emerald-600 to-green-700',
  'json-csv':          'bg-gradient-to-br from-yellow-500 to-amber-600',
  // Developer
  'dev-station':    'bg-gradient-to-br from-violet-600 to-purple-700',
  'api-playground': 'bg-gradient-to-br from-blue-500 to-cyan-600',
  'smart-jwt':      'bg-gradient-to-br from-pink-500 to-rose-500',
  'smart-json':     'bg-gradient-to-br from-orange-500 to-amber-500',
  'smart-sql':      'bg-gradient-to-br from-cyan-600 to-teal-500',
  'cron-gen':       'bg-gradient-to-br from-slate-500 to-gray-700',
  'git-cheats':     'bg-gradient-to-br from-red-600 to-orange-500',
  'smart-diff':     'bg-gradient-to-br from-indigo-500 to-violet-600',
  'regex-tester':   'bg-gradient-to-br from-amber-500 to-yellow-600',
  'hash-gen':       'bg-gradient-to-br from-emerald-500 to-teal-600',
  'num-convert':    'bg-gradient-to-br from-purple-500 to-violet-600',
  'timestamp-tool': 'bg-gradient-to-br from-sky-500 to-cyan-600',
  // Productivity
  'life-os':    'bg-gradient-to-br from-rose-500 to-pink-600',
  'qr-code':    'bg-gradient-to-br from-slate-700 to-slate-900',
  'smart-pass': 'bg-gradient-to-br from-emerald-500 to-green-600',
  'pomodoro':   'bg-gradient-to-br from-red-500 to-orange-500',
  // Converters
  'unit-convert':  'bg-gradient-to-br from-cyan-500 to-sky-600',
  'case-convert':  'bg-gradient-to-br from-orange-500 to-amber-500',
  // Design
  'color-picker':  'bg-gradient-to-br from-pink-500 to-rose-600',
  'color-studio':  'bg-gradient-to-br from-violet-500 to-purple-600',
  // Health
  'smart-bmi':     'bg-gradient-to-br from-teal-500 to-cyan-600',
  'smart-breath':  'bg-gradient-to-br from-sky-500 to-blue-600',
  'smart-workout': 'bg-gradient-to-br from-lime-500 to-green-600',
  // AI
  'prompt-generator': 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
  'smart-chat':       'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  'smart-analyze':    'bg-gradient-to-br from-purple-600 to-indigo-600',
  // Creator
  'audio-transcription': 'bg-gradient-to-br from-rose-500 to-orange-500',
};

/* Category → colored top-edge accent for the card */
const CATEGORY_TOP_EDGE: Record<string, string> = {
  Analytics:    'from-blue-500 to-cyan-400',
  Finance:      'from-emerald-500 to-teal-400',
  Business:     'from-violet-500 to-indigo-400',
  Documents:    'from-amber-500 to-orange-400',
  Developer:    'from-purple-500 to-violet-400',
  Productivity: 'from-rose-500 to-pink-400',
  Converters:   'from-cyan-500 to-sky-400',
  Design:       'from-pink-500 to-fuchsia-400',
  Health:       'from-teal-500 to-emerald-400',
  AI:           'from-fuchsia-500 to-purple-400',
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

  return (
    <Link href={href} className="group relative block" aria-label={`Open ${tool.name} tool`}>
      <article className="relative h-full rounded-xl bg-white dark:bg-[#151827] border border-slate-200/80 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/25 flex flex-row overflow-hidden">
        {/* Colored left edge */}
        <div className={`w-[3px] min-h-full bg-gradient-to-b ${topEdge} opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0`} />

        <div className="px-3.5 pt-3 pb-3 flex flex-col gap-2 flex-1 min-w-0">
          {/* Top row: icon + popular badge */}
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl text-white shadow-sm transform group-hover:scale-110 group-hover:shadow-md transition-all duration-200 ${TOOL_ICON_BG[tool.id] ?? theme.iconBg}`}>
              {IconComponent ? <IconComponent size={18} /> : null}
            </div>
            {tool.popular && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star size={10} fill="currentColor" />
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">
            {tool.name}
          </h3>

          {/* Description */}
          {tool.description && (
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {tool.description}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
