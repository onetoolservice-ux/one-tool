'use client';
import React from 'react';

// Simplified Shell: No header, just layout structure
export default function ToolShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full bg-[#0F111A] text-white">
      {/* Content Area */}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
