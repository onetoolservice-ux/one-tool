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
      <ToolShell tool={tool} fullWidth={['analyticsreport', 'self-serve-analytics', 'invoice-generator', 'salary-slip', 'rent-receipt', 'id-card', 'smart-agreement', 'managetransaction', 'expenses', 'credits', 'smart-pdf-merge', 'smart-pdf-split', 'smart-ocr', 'smart-scan', 'smart-excel', 'smart-word', 'universal-converter', 'smart-img-compress', 'smart-img-convert', 'smart-jwt', 'smart-diff', 'cron-gen', 'api-playground', 'regex-tester', 'hash-gen', 'num-convert', 'timestamp-tool', 'dev-station', 'smart-budget', 'smart-sip', 'smart-net-worth', 'smart-retirement', 'gst-calculator', 'smart-loan', 'smart-pass', 'pomodoro', 'qr-code', 'unit-convert', 'color-picker', 'case-convert', 'color-studio'].includes(tool.id)}>
        <ToolSEOUI tool={tool} />
        {ToolComponent}
      </ToolShell>
    </>
  );
}
