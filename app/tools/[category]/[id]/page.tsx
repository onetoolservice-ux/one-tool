import React from 'react';
import { notFound } from 'next/navigation';
import { getToolById } from '@/app/lib/utils/tools-fallback';
import ToolShell from '@/app/components/tools/tool-shell';
import { ToolLoader } from '@/app/components/tools/tool-loader';
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const tool = getToolById(resolvedParams.id);
  if (!tool) return { title: 'Tool Not Found' };

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

export default async function ToolPage(props: { params: Promise<{ category: string; id: string }> }) {
  const params = await props.params;
  const tool = getToolById(params.id);
  if (!tool) return notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';
  const ToolComponent = <ToolLoader toolId={tool.id} />;

  return (
    <>
      <ToolSEOSchemas tool={tool} baseUrl={baseUrl} includeFAQ={true} />
      <ToolShell tool={tool} fullWidth>
        <ToolSEOUI tool={tool} />
        {ToolComponent}
      </ToolShell>
    </>
  );
}
