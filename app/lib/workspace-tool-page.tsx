import React from 'react';
import { notFound } from 'next/navigation';
import { getToolById } from '@/app/lib/utils/tools-fallback';
import ToolShell from '@/app/components/tools/ToolShell';
import { ToolLoader } from '@/app/components/tools/ToolLoader';
import { ToolSEOSchemas } from '@/app/components/seo/ToolSEOSchemas';
import { ToolSEOUI } from '@/app/components/seo/ToolSEOUI';
import type { Metadata } from 'next';
import {
  generateSEOTitle,
  generateSEODescription,
  generateKeywords,
  generateOpenGraph,
  generateTwitterCard,
} from '@/app/lib/seo/metadata-generator';

// Shared by app/my-finance/[id]/page.tsx and app/my-business/[id]/page.tsx —
// same SEO/rendering pipeline as the legacy app/tools/[category]/[id]/page.tsx,
// scoped to one workspace's category so a tool can't be reached from the wrong workspace URL.

export async function generateWorkspaceToolMetadata(
  { params }: { params: Promise<{ id: string }> },
  category: string
): Promise<Metadata> {
  const { id } = await params;
  const tool = getToolById(id);
  if (!tool || tool.category !== category) return { title: 'Tool Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';
  const title = generateSEOTitle(tool);
  const description = generateSEODescription(tool);
  const keywords = generateKeywords(tool);
  const openGraph = generateOpenGraph(tool, baseUrl);
  const twitter = generateTwitterCard(tool, baseUrl);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    alternates: {
      canonical: `${baseUrl}${tool.href}`,
    },
    openGraph,
    twitter,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export async function WorkspaceToolPage({ id, category }: { id: string; category: string }) {
  const tool = getToolById(id);
  if (!tool || tool.category !== category) return notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';

  return (
    <>
      <ToolSEOSchemas tool={tool} baseUrl={baseUrl} includeFAQ={true} />
      <ToolShell tool={tool} fullWidth>
        <ToolSEOUI tool={tool} />
        <ToolLoader toolId={tool.id} />
      </ToolShell>
    </>
  );
}
