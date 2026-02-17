import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/app/lib/tools-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';

  const toolUrls = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.category.toLowerCase()}/${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...toolUrls,
  ];
}
