import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/projects/*', '/blog/*', '/contact', '/careers', '/faq', '/leadership'],
        disallow: ['/admin/*', '/api/*'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
    ],
    sitemap: 'https://sviiinfrasolutions.com/sitemap.xml',
  };
}
