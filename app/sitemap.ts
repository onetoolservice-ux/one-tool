import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://onetool.vercel.app'; // Change this after deploying

  const routes = [
    '',
    '/tools',
    '/ai',
    '/about',
    '/learn',
    '/settings',
    '/tools/finance/budget-tracker',
    '/tools/finance/loan-emi',
    '/tools/documents/pdf/merge',
    '/tools/documents/image/compressor',
    '/tools/documents/image/converter',
    '/tools/documents/json/formatter',
    '/tools/health/bmi',
    '/tools/health/breathing',
    '/tools/health/timer',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
