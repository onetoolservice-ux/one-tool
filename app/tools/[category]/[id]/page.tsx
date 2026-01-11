import React from 'react';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { getToolById } from '@/app/lib/utils/tools-fallback';
import ToolShell from '@/app/components/tools/tool-shell';
import { ToolLoader } from '@/app/components/tools/tool-loader';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  // Use static data - no database call needed
  const tool = getToolById(resolvedParams.id);
  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} - Free Online Tool | OneTool`,
    description: tool.description || `${tool.name} - Free online tool`,
    alternates: { canonical: `https://onetool.com${tool.href}` }
  };
}

export default async function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = await props.params;
  // Use static data - no database call needed
  const tool = getToolById(params.id);
  if (!tool) return notFound();

  // FIX: Schema as pure JSON object
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description || tool.name,
    applicationCategory: tool.category,
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  // Use ToolLoader client component to handle dynamic imports
  const ToolComponent = <ToolLoader toolId={tool.id} />;

  return (
    <>
      <Script
        id={`tool-schema-${tool.id}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <ToolShell tool={tool}>
        {ToolComponent}
      </ToolShell>
    </>
  );
}
