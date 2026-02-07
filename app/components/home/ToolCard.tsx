'use client';

import React from 'react';
import Link from 'next/link';
import { getTheme } from '@/app/lib/theme-config';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';

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

  return (
    <Link href={href} className="group relative block" aria-label={`Open ${tool.name} tool`}>
      <article className={`relative p-3.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex items-center gap-3.5 hover:shadow-lg ${theme.shadow}`}>
        <div className={`w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-white shadow-sm transform group-hover:scale-105 transition-transform duration-200 ${theme.iconBg}`}>
          {IconComponent ? <IconComponent size={20} /> : null}
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors truncate">
          {tool.name}
        </h3>
      </article>
    </Link>
  );
}
