import React from 'react';
import type { Tool } from '@/app/lib/utils/tools-fallback';

interface ToolSEOUIProps {
  tool: Tool;
}

export function ToolSEOUI({ tool }: ToolSEOUIProps) {
  // Hidden SEO content for search engines
  return (
    <div className="sr-only" aria-hidden="true">
      <h1>{tool.name}</h1>
      {tool.description && <p>{tool.description}</p>}
    </div>
  );
}
