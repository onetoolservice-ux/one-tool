import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/app/lib/tools-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';

  // Use a fixed build date so Google doesn't think all pages change on every deploy
  const SITE_LAST_UPDATED = new Date('2026-03-12');

  // Unique category slugs derived from tool hrefs (e.g. "personal-finance", "developer")
  const categorySlugs = [...new Set(ALL_TOOLS.map((t) => t.href.split('/')[2]))];
  const categoryUrls = categorySlugs.map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: SITE_LAST_UPDATED,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Use tool.href directly — category names contain spaces that break URLs if used raw
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
    ...categoryUrls,
    ...toolUrls,
  ];
}
