import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { CATEGORY_KEYWORDS } from '@/app/lib/seo/category-keywords';

// Build the unique set of category slugs from actual tool hrefs
function getAllCategorySlugs(): string[] {
  const slugs = new Set(ALL_TOOLS.map((t) => t.href.split('/')[2]));
  return Array.from(slugs);
}

function getToolsForSlug(slug: string) {
  return ALL_TOOLS.filter((t) => t.href.split('/')[2] === slug);
}

function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateStaticParams() {
  return getAllCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const tools = getToolsForSlug(category);
  if (tools.length === 0) return { title: 'Not Found' };

  const label = slugToLabel(category);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';
  const extraKws = CATEGORY_KEYWORDS[label] || [];
  const toolNames = tools
    .slice(0, 5)
    .map((t) => t.name)
    .join(', ');

  return {
    title: `${label} Tools — Free Online ${label} Utilities`,
    description: `Free online ${label} tools: ${toolNames} and more. No signup required. Works in your browser.`,
    keywords: [
      `free ${label.toLowerCase()} tools`,
      `online ${label.toLowerCase()} tools`,
      `${label.toLowerCase()} utilities free`,
      ...extraKws,
      'free online tools',
      'no signup',
      'onetool',
    ].join(', '),
    alternates: {
      canonical: `${baseUrl}/tools/${category}`,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${label} Tools — Free Online ${label} Utilities | OneTool`,
      description: `${tools.length} free online ${label} tools. No signup. Works in your browser.`,
      url: `${baseUrl}/tools/${category}`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const tools = getToolsForSlug(category);
  if (tools.length === 0) return notFound();

  const label = slugToLabel(category);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';
  const extraKws = CATEGORY_KEYWORDS[label] || [];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: label, item: `${baseUrl}/tools/${category}` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${label} Tools`,
    description: `Free online ${label} tools on OneTool. No signup required.`,
    url: `${baseUrl}/tools/${category}`,
    hasPart: tools.map((t) => ({
      '@type': 'SoftwareApplication',
      name: t.name,
      url: `${baseUrl}${t.href}`,
      applicationCategory: label,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200">{label}</span>
        </nav>

        {/* Page heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Free Online {label} Tools
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          {tools.length} free {label.toLowerCase()} tools. No signup required. Works entirely in
          your browser.
        </p>

        {/* Tool grid */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <li key={tool.id}>
              <Link
                href={tool.href}
                className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-gray-900 dark:text-white mb-1">{tool.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{tool.desc}</p>
                {tool.popular && (
                  <span className="inline-block mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    Popular
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* SEO text — keyword-rich description for this category */}
        <section className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About {label} Tools on OneTool</h2>
          <p>
            OneTool provides {tools.length} free {label.toLowerCase()} tools that run entirely in
            your browser. No account, no email, no subscription. Your data stays on your device.
          </p>
          {extraKws.length > 0 && (
            <p>
              These tools help with: {extraKws.slice(0, 6).join(', ')}.
            </p>
          )}
          <p>
            All tools are part of the OneTool suite — a free collection of 60+ utilities for
            finance, productivity, developer tasks, PDF management, and more.
          </p>
        </section>
      </main>
    </>
  );
}
