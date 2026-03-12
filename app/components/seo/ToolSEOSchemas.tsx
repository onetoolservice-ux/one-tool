import React from 'react';
import type { Tool } from '@/app/lib/utils/tools-fallback';

interface ToolSEOSchemasProps {
  tool: Tool;
  baseUrl: string;
  includeFAQ?: boolean;
}

export function ToolSEOSchemas({ tool, baseUrl, includeFAQ = false }: ToolSEOSchemasProps) {
  const toolUrl = `${baseUrl}${tool.href}`;
  const categoryLabel = tool.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const description = tool.description || `Free online ${tool.name} tool`;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description,
    url: toolUrl,
    applicationCategory: categoryLabel,
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    provider: {
      '@type': 'Organization',
      name: 'OneTool',
      url: baseUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabel,
        item: `${baseUrl}/tools/${tool.href.split('/')[2]}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: toolUrl,
      },
    ],
  };

  const faqSchema = includeFAQ
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `What is ${tool.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${tool.name} is a free online tool that ${description.toLowerCase().replace(/^free online tool[^.]*\.\s*/, '')} It is part of OneTool — a collection of 60+ browser-based utilities that require no signup.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is ${tool.name} free to use?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes, ${tool.name} is completely free to use. There are no hidden charges, no subscription, and no account required.`,
            },
          },
          {
            '@type': 'Question',
            name: `Does ${tool.name} require login or signup?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `No. ${tool.name} requires no login, signup, or email. Open the tool and start using it immediately in your browser.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is my data safe with ${tool.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. ${tool.name} is a local-first tool — all your data stays in your browser. Nothing is uploaded to any server.`,
            },
          },
        ],
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
