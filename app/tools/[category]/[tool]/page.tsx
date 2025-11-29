"use client";

import React, { useState, use } from 'react';

// 1. Define strict types for the parameters
type ToolParams = Promise<{
  category: string;
  tool: string;
}>;

export default function GenericToolPage({ params }: { params: ToolParams }) {
  // 2. Unwrap params using React.use() (Required for Next.js 16)
  const { category, tool } = use(params);

  // 3. State is strictly typed
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-sm text-muted dark:text-muted dark:text-muted dark:text-muted capitalize">
          <span>Tools</span>
          <span>/</span>
          <span>{category}</span>
        </div>
        <h1 className="text-3xl font-bold text-main dark:text-slate-100 dark:text-slate-200 capitalize">
          {tool.replace(/-/g, ' ')}
        </h1>
        <p className="text-muted dark:text-muted dark:text-muted dark:text-muted">
          This is a placeholder for the {tool} tool. 
          The specific logic for this tool will be loaded here.
        </p>
      </div>

      {/* Placeholder Content Area */}
      <div className="p-12 text-center bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-xl border border-dashed border-line">
        <div className="w-16 h-16 bg-surface dark:bg-slate-800 dark:bg-surface rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-200/50 dark:shadow-none text-2xl">
          🛠️
        </div>
        <h3 className="text-lg font-medium text-main dark:text-slate-100 dark:text-slate-200">Work in Progress</h3>
        <p className="text-muted dark:text-muted dark:text-muted dark:text-muted max-w-md mx-auto mt-2">
          We have set up the route for <strong>{tool}</strong>. 
          The specific calculator or converter logic goes here.
        </p>
      </div>
    </div>
  );
}