'use client';

import React from 'react';

// FIX: 'export default' maintained for stability
export default function ToolShell({ tool, children }: { tool: any, children: React.ReactNode }) {
  return (
    // Adaptive Background: Light Mode (gray-50) / Dark Mode (#0F111A)
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* TOOL CANVAS */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

    </div>
  );
}
