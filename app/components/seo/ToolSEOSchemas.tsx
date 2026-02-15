import React from 'react';
import type { Tool } from '@/app/lib/utils/tools-fallback';

interface ToolSEOSchemasProps {
  tool: Tool;
  baseUrl: string;
  includeFAQ?: boolean;
}

export function ToolSEOSchemas({ tool, baseUrl, includeFAQ }: ToolSEOSchemasProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description || `Free online ${tool.name} tool`,
    url: `${baseUrl}${tool.href}`,
    applicationCategory: tool.category,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
