import { createFileRoute } from '@tanstack/react-router';

import { URL as SITE_URL } from '@/lib/constants';

// Static routes that should always be in the sitemap
const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/new', changefreq: 'weekly', priority: '0.8' },
  { path: '/changelog', changefreq: 'monthly', priority: '0.6' },
];

function generateSitemap(): string {
  const today = new Date().toISOString().split('T')[0];

  const urls = STATIC_ROUTES.map(
    (route) => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const sitemap = generateSitemap();

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          },
        });
      },
    },
  },
});
