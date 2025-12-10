'use client';

import React from 'react';
import { LayoutGrid, Briefcase, DollarSign, FileText, Code, Zap, Heart, Sparkles, PenTool, RefreshCw } from 'lucide-react';

export default function CategoryNav({ active, onChange }: { active: string, onChange: (id: string) => void }) {
  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'business', label: 'Business' },
    { id: 'finance', label: 'Finance' },
    { id: 'documents', label: 'Documents' },
    { id: 'developer', label: 'Developer' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'health', label: 'Health' },
    { id: 'ai', label: 'AI' },
    { id: 'design', label: 'Design' },
    { id: 'converters', label: 'Converters' },
  ];

  return (
    // FIX: Removed 'sticky', 'top-16', 'z-40'. Now it's a solid block that sits under the header.
    <div className="w-full border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0F111A] transition-colors duration-300 flex-shrink-0">
      <div className="max-w-[1800px] mx-auto px-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-8 h-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`text-sm font-medium transition-all relative h-12 px-1 flex items-center whitespace-nowrap ${
                active === cat.id
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {cat.id === 'all' && <LayoutGrid size={14} className="inline mr-2" />}
              {cat.label}
              {active === cat.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
