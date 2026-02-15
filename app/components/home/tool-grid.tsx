'use client';

import React, { useMemo, memo } from 'react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { fuzzySearch } from '@/app/lib/search-utils';
import { Search } from 'lucide-react';
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

export const ToolGrid = memo(({ category, searchQuery }: { category: string, searchQuery?: string }) => {
  const tools = useMemo(() => {
    if (category === 'all') return ALL_TRANSFORMED;
    const categoryMap: Record<string, string> = {
      'analytics': 'Analytics', 'finance': 'Finance', 'business': 'Business',
      'documents': 'Documents', 'developer': 'Developer', 'productivity': 'Productivity',
      'converters': 'Converters', 'design': 'Design', 'health': 'Health',
      'ai': 'AI', 'creator': 'Creator',
    };
    const normalizedCategory = categoryMap[category] || category;
    return ALL_TRANSFORMED.filter(tool => tool.category === normalizedCategory);
  }, [category]);

  const filteredTools = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') return tools;
    const searchableTools = tools.map(t => ({ ...t, title: t.name }));
    const results = fuzzySearch(searchableTools, searchQuery, ['title', 'category']);
    return results.map(r => tools.find(t => t.id === r.id)!).filter(Boolean);
  }, [tools, searchQuery]);

  if (filteredTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
          <Search className="text-gray-500 dark:text-gray-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">No tools found</h3>
        <p className="text-xs text-gray-500 mt-1">
          {searchQuery ? `No results for "${searchQuery}"` : `Category ${category} is empty.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {filteredTools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
});

ToolGrid.displayName = 'ToolGrid';
