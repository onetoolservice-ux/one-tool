import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://onetool.co.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/api/',
          '/_next/',
        ],
      },
      // Allow Googlebot to crawl everything
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/private/', '/api/'],
      },
      // Allow Bingbot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/private/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}