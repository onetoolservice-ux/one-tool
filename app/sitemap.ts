import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/app/lib/tools-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';

  // Always reflects the latest deploy so Google re-crawls on every release
  const SITE_LAST_UPDATED = new Date();

  // Workspace landing pages — the two entry points of the finance-only pivot
  const workspaceUrls = [
    { url: `${baseUrl}/my-finance`, priority: 0.9 },
    { url: `${baseUrl}/my-business`, priority: 0.9 },
  ].map((w) => ({
    ...w,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: 'weekly' as const,
  }));

  // Use tool.href directly — every tool now lives under /my-finance/{id} or /my-business/{id}
  const toolUrls = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: SITE_LAST_UPDATED,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...workspaceUrls,
    ...toolUrls,
  ];
}
