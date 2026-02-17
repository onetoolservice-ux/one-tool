'use client';

import React, { useMemo, memo } from 'react';
import { ALL_TOOLS, CATEGORY_ORDER } from '@/app/lib/tools-data';
import { fuzzySearch } from '@/app/lib/search-utils';
import {
  Search, BarChart3, Wallet, Briefcase, FileText,
  Terminal, Zap, ArrowRightLeft, Palette, Heart, Brain, Mic,
} from 'lucide-react';
import { ToolCard } from './ToolCard';

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

const transformTool = (tool: any): Tool => ({
  id: tool.id,
  name: tool.name,
  description: tool.desc || tool.description,
  category: tool.category,
  href: tool.href,
  icon_name: typeof tool.icon === 'string' ? tool.icon : undefined,
  color: tool.color,
  popular: tool.popular || false,
  status: 'Active',
});

const ALL_TRANSFORMED = ALL_TOOLS.map(transformTool);

const SECTION_ICONS: Record<string, React.ElementType> = {
  Analytics: BarChart3, Finance: Wallet, Business: Briefcase,
  Documents: FileText, Developer: Terminal, Productivity: Zap,
  Converters: ArrowRightLeft, Design: Palette, Health: Heart,
  AI: Brain, Creator: Mic,
};

const SECTION_COLORS: Record<string, { iconBg: string; icon: string; text: string; line: string; count: string; edge: string }> = {
  Analytics:    { iconBg: 'bg-blue-100 dark:bg-blue-500/15', icon: 'text-blue-600 dark:text-blue-400', text: 'text-blue-700 dark:text-blue-300', line: 'from-blue-300/60 dark:from-blue-700/60', count: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', edge: 'border-blue-500' },
  Finance:      { iconBg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: 'text-emerald-600 dark:text-emerald-400', text: 'text-emerald-700 dark:text-emerald-300', line: 'from-emerald-300/60 dark:from-emerald-700/60', count: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', edge: 'border-emerald-500' },
  Business:     { iconBg: 'bg-violet-100 dark:bg-violet-500/15', icon: 'text-violet-600 dark:text-violet-400', text: 'text-violet-700 dark:text-violet-300', line: 'from-violet-300/60 dark:from-violet-700/60', count: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400', edge: 'border-violet-500' },
  Documents:    { iconBg: 'bg-amber-100 dark:bg-amber-500/15', icon: 'text-amber-600 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-300', line: 'from-amber-300/60 dark:from-amber-700/60', count: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', edge: 'border-amber-500' },
  Developer:    { iconBg: 'bg-purple-100 dark:bg-purple-500/15', icon: 'text-purple-600 dark:text-purple-400', text: 'text-purple-700 dark:text-purple-300', line: 'from-purple-300/60 dark:from-purple-700/60', count: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400', edge: 'border-purple-500' },
  Productivity: { iconBg: 'bg-rose-100 dark:bg-rose-500/15', icon: 'text-rose-600 dark:text-rose-400', text: 'text-rose-700 dark:text-rose-300', line: 'from-rose-300/60 dark:from-rose-700/60', count: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400', edge: 'border-rose-500' },
  Converters:   { iconBg: 'bg-cyan-100 dark:bg-cyan-500/15', icon: 'text-cyan-600 dark:text-cyan-400', text: 'text-cyan-700 dark:text-cyan-300', line: 'from-cyan-300/60 dark:from-cyan-700/60', count: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400', edge: 'border-cyan-500' },
  Design:       { iconBg: 'bg-pink-100 dark:bg-pink-500/15', icon: 'text-pink-600 dark:text-pink-400', text: 'text-pink-700 dark:text-pink-300', line: 'from-pink-300/60 dark:from-pink-700/60', count: 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400', edge: 'border-pink-500' },
  Health:       { iconBg: 'bg-teal-100 dark:bg-teal-500/15', icon: 'text-teal-600 dark:text-teal-400', text: 'text-teal-700 dark:text-teal-300', line: 'from-teal-300/60 dark:from-teal-700/60', count: 'bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400', edge: 'border-teal-500' },
  AI:           { iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15', icon: 'text-fuchsia-600 dark:text-fuchsia-400', text: 'text-fuchsia-700 dark:text-fuchsia-300', line: 'from-fuchsia-300/60 dark:from-fuchsia-700/60', count: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-400', edge: 'border-fuchsia-500' },
  Creator:      { iconBg: 'bg-orange-100 dark:bg-orange-500/15', icon: 'text-orange-600 dark:text-orange-400', text: 'text-orange-700 dark:text-orange-300', line: 'from-orange-300/60 dark:from-orange-700/60', count: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400', edge: 'border-orange-500' },
};

export const ToolGrid = memo(({ searchQuery }: { searchQuery?: string }) => {
  /* When searching, show a flat filtered grid */
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return null;
    const searchableTools = ALL_TRANSFORMED.map(t => ({ ...t, title: t.name }));
    const results = fuzzySearch(searchableTools, searchQuery, ['title', 'category']);
    return results.map(r => ALL_TRANSFORMED.find(t => t.id === r.id)!).filter(Boolean);
  }, [searchQuery]);

  /* Group tools by category (preserving CATEGORY_ORDER) */
  const sections = useMemo(() => {
    return CATEGORY_ORDER.map(cat => ({
      category: cat,
      tools: ALL_TRANSFORMED.filter(t => t.category === cat),
    })).filter(s => s.tools.length > 0);
  }, []);

  /* Search mode: flat grid */
  if (searchResults !== null) {
    if (searchResults.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <Search className="text-gray-500 dark:text-gray-400" size={20} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">No tools found</h3>
          <p className="text-xs text-gray-500 mt-1">No results for &ldquo;{searchQuery}&rdquo;</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {searchResults.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    );
  }

  /* Default: sectioned layout */
  return (
    <div className="space-y-6">
      {sections.map(({ category, tools }) => {
        const Icon = SECTION_ICONS[category] || BarChart3;
        const colors = SECTION_COLORS[category] || SECTION_COLORS.Analytics;

        return (
          <section key={category} id={`section-${category.toLowerCase()}`}>
            {/* Section header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.iconBg}`}>
                <Icon size={14} className={colors.icon} />
              </div>
              <h2 className={`text-[13px] font-bold ${colors.text} uppercase tracking-wide`}>
                {category}
              </h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.count}`}>
                {tools.length}
              </span>
              <div className={`h-px flex-1 bg-gradient-to-r ${colors.line} to-transparent`} />
            </div>

            {/* Tools grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});

ToolGrid.displayName = 'ToolGrid';
