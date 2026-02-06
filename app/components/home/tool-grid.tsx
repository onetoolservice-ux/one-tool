'use client';

import React, { useMemo, memo } from 'react';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { fuzzySearch } from '@/app/lib/search-utils';
import { getIconNameFromComponent } from '@/app/lib/utils/tools-helper';
import { Search } from 'lucide-react';
import { ToolCard } from './ToolCard';

// Transform ALL_TOOLS to match Tool interface format
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

// Transform tools data to include icon_name for compatibility
const transformTool = (tool: any): Tool => {
  return {
    id: tool.id,
    name: tool.name,
    description: tool.desc || tool.description,
    category: tool.category,
    href: tool.href,
    icon_name: getIconNameFromComponent(tool.icon) || undefined,
    color: tool.color,
    popular: tool.popular || false,
    status: 'Active',
  };
};

export const ToolGrid = memo(({ category, searchQuery }: { category: string, searchQuery?: string }) => {
  // Use static frontend data - no database calls needed for static tool catalog
  const tools = useMemo(() => {
    const allTools = ALL_TOOLS.map(transformTool);
    
    if (category === 'all') {
      return allTools;
    }
    
    // Normalize category name
    const categoryMap: Record<string, string> = {
      'analytics': 'Analytics',
      'finance': 'Finance',
      'business': 'Business',
      'documents': 'Documents',
      'developer': 'Developer',
      'productivity': 'Productivity',
      'converters': 'Converters',
      'design': 'Design',
      'health': 'Health',
      'ai': 'AI',
      'creator': 'Creator',
    };
    
    const normalizedCategory = categoryMap[category] || category;
    return allTools.filter(tool => tool.category === normalizedCategory);
  }, [category]);

  // Memoize filtered tools using enhanced fuzzy search with synonyms
  const filteredTools = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return tools;
    }
    // Use fuzzy search with synonym expansion for better results
    // This handles mismatched keywords like "money" finding "budget" tools
    const searchableTools = tools.map(t => ({
      ...t,
      id: t.id,
      title: t.name,
      category: t.category,
    }));
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredTools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
});

ToolGrid.displayName = 'ToolGrid';
