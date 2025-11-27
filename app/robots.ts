import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/settings', // Don't index private settings pages
    },
    sitemap: 'https://onetool.vercel.app/sitemap.xml',
  };
}
