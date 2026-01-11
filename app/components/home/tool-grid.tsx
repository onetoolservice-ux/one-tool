'use client';

import React, { useMemo, memo } from 'react';
import Link from 'next/link';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getIcon } from '@/app/lib/utils/icon-mapper';
import { getIconNameFromComponent } from '@/app/lib/utils/tools-helper';
import { Search } from 'lucide-react';

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
    icon_name: getIconNameFromComponent(tool.icon),
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
      'business': 'Business',
      'finance': 'Finance',
      'documents': 'Documents',
      'developer': 'Developer',
      'productivity': 'Productivity',
      'health': 'Health',
      'ai': 'AI',
      'design': 'Design',
      'converters': 'Converters',
    };
    
    const normalizedCategory = categoryMap[category] || category;
    return allTools.filter(tool => tool.category === normalizedCategory);
  }, [category]);

  // Memoize filtered tools to avoid recalculating on every render
  const filteredTools = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return tools;
    }
    const query = searchQuery.toLowerCase().trim();
    return tools.filter(tool => {
      const nameMatch = tool.name.toLowerCase().includes(query);
      const descMatch = tool.description?.toLowerCase().includes(query) || false;
      const categoryMatch = tool.category.toLowerCase().includes(query);
      return nameMatch || descMatch || categoryMatch;
    });
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

  // Extract background color from Tailwind classes - ensure dark enough for white text
  const colorMap: Record<string, string> = {
    'emerald': 'bg-emerald-600',
    'blue': 'bg-blue-600',
    'indigo': 'bg-indigo-600',
    'purple': 'bg-purple-600',
    'violet': 'bg-violet-600',
    'rose': 'bg-rose-600',
    'red': 'bg-red-600',
    'orange': 'bg-orange-600',
    'amber': 'bg-amber-600',
    'yellow': 'bg-yellow-600',
    'lime': 'bg-lime-600',
    'green': 'bg-green-600',
    'teal': 'bg-teal-600',
    'cyan': 'bg-cyan-600',
    'sky': 'bg-sky-600',
    'pink': 'bg-pink-600',
    'fuchsia': 'bg-fuchsia-600',
    'slate': 'bg-slate-700',
    'gray': 'bg-gray-700',
    'zinc': 'bg-zinc-700',
    'neutral': 'bg-neutral-700',
    'stone': 'bg-stone-700',
  };

  const getBgColor = (color: string | undefined): string => {
    if (!color) return 'bg-indigo-600';
    // Extract color name from text class (e.g., "text-emerald-600 bg-emerald-50")
    const match = color.match(/text-(\w+)-(\d+)/);
    if (match) {
      const [, colorName] = match;
      return colorMap[colorName] || 'bg-indigo-600';
    }
    return 'bg-indigo-600';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredTools.map((tool) => {
        const bgColor = getBgColor(tool.color);
        return (
          <Link 
            key={tool.id} 
            href={tool.href}
            aria-label={`Open ${tool.name} tool`}
            className="group relative bg-white dark:bg-[#1C1F2E] border border-gray-100 dark:border-white/5 p-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-black/50 hover:border-emerald-500/30 flex items-center gap-3 h-[72px]"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${bgColor} shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform`}>
              {tool.icon_name ? getIcon(tool.icon_name, 18) : (
                // Fallback: try to get icon from ALL_TOOLS
                (() => {
                  const originalTool = ALL_TOOLS.find(t => t.id === tool.id);
                  if (originalTool?.icon) {
                    const IconComponent = originalTool.icon;
                    return <IconComponent size={18} />;
                  }
                  return null;
                })()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                {tool.name}
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-300 truncate opacity-80">
                {tool.description || ''}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
});

ToolGrid.displayName = 'ToolGrid';
