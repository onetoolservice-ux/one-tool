import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/app/lib/tools-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://onetool.co.in';

  // 1. Static Pages
  const staticPages = [
    '',
    '/privacy',
    '/terms',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.5,
  }));

  // 2. Tool Pages (High Priority)
  const toolPages = ALL_TOOLS.map(tool => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority for tools
  }));

  // 3. Category Pages
  const categories = Array.from(new Set(ALL_TOOLS.map(t => t.category.toLowerCase())));
  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/tools/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...toolPages, ...categoryPages];
}
