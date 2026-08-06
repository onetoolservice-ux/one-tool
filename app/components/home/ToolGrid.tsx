'use client';

import React, { useMemo, memo } from 'react';
import { ALL_TOOLS, CATEGORY_ORDER } from '@/app/lib/tools-data';
import { getCategoryMeta } from '@/app/lib/category-config';
import { fuzzySearch } from '@/app/lib/search-utils';
import { Search, LayoutGrid } from 'lucide-react';
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

export const ToolGrid = memo(({ searchQuery, categoryFilter }: { searchQuery?: string; categoryFilter?: string }) => {
  /* When searching, show a flat filtered grid */
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return null;
    const searchableTools = ALL_TRANSFORMED.map(t => ({ ...t, title: t.name }));
    const results = fuzzySearch(searchableTools, searchQuery, ['title', 'category']);
    return results.map(r => ALL_TRANSFORMED.find(t => t.id === r.id)!).filter(Boolean);
  }, [searchQuery]);

  /* Group tools by category (preserving CATEGORY_ORDER), optionally filtered */
  const sections = useMemo(() => {
    return CATEGORY_ORDER.map(cat => ({
      category: cat,
      tools: ALL_TRANSFORMED.filter(t => t.category === cat),
    }))
      .filter(s => s.tools.length > 0)
      .filter(s => {
        if (!categoryFilter) return true;
        // Compare by normalised slug: "personal-finance" matches "Personal Finance"
        const slug = s.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filterSlug = categoryFilter.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (slug === filterSlug) return true;
        // Also match plain lowercase like "developer"
        if (s.category.toLowerCase() === categoryFilter.replace(/-/g, ' ')) return true;
        return false;
      });
  }, [categoryFilter]);

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
      <div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {searchResults.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    );
  }

  /* Default: sectioned layout */
  return (
    <div className="space-y-6">
      {sections.map(({ category, tools }) => {
        const meta = getCategoryMeta(category);
        const Icon = meta.Icon ?? LayoutGrid;

        return (
          <section key={category} id={`section-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
            {/* Section header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.sectionIconBg}`}>
                <Icon size={14} className={meta.sectionIconText} />
              </div>
              <h2 className={`text-[13px] font-bold ${meta.sectionText} uppercase tracking-wide`}>
                {category}
              </h2>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.sectionCount}`}>
                {tools.length}
              </span>
              <div className={`h-px flex-1 bg-gradient-to-r ${meta.sectionLine} to-transparent`} />
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
