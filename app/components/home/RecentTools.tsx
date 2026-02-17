'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { useRecentTools } from '@/app/hooks/useRecentTools';
import { ToolCard } from './ToolCard';

const transformTool = (tool: any) => ({
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

export function RecentTools() {
  const { recentTools } = useRecentTools();

  // Don't show if no history (first-time visitors)
  if (recentTools.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Clock size={13} className="text-gray-400" />
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recently Used</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {recentTools.map(tool => (
          <ToolCard key={tool.id} tool={transformTool(tool)} />
        ))}
      </div>
    </section>
  );
}
