'use client';

import React from 'react';
import { ToolGuide } from '@/app/components/shared/ToolGuide';

interface Tool {
  id: string;
  name: string;
  description?: string;
  category: string;
  href: string;
}

export default function ToolShell({ tool, children, fullWidth = false }: { tool: Tool, children: React.ReactNode, fullWidth?: boolean }) {
  return (
    // Adaptive Background: Light Mode (gray-50) / Dark Mode (#0F111A)
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] text-gray-900 dark:text-white transition-colors duration-300">

      {/* TOOL CANVAS */}
      <main className={`flex-1 w-full ${fullWidth ? 'max-w-full p-0' : 'max-w-[1800px] p-4 md:p-8'} mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500`}>
        {children}
      </main>

      {/* Contextual guide — only renders if a guide exists for this tool */}
      <ToolGuide toolId={tool.id} />
    </div>
  );
}
