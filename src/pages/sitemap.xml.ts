import type { APIContext } from 'astro';
import { SITE_URL, escapeXml, toW3CDate } from '../lib/xml';

interface SitemapRow {
  slug: string;
  updated_at: string;
}

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0', lastmod: '2026-04-07' },
  { path: '/sessions', changefreq: 'weekly', priority: '0.9', lastmod: '2026-04-07' },
  { path: '/about', changefreq: 'monthly', priority: '0.7', lastmod: '2026-04-07' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5', lastmod: '2026-04-07' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3', lastmod: '2026-04-07' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3', lastmod: '2026-04-07' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3', lastmod: '2026-04-07' },
];

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;

  const { results } = await db.prepare(
    "SELECT slug, updated_at FROM sessions WHERE status = 'published' ORDER BY published_at DESC"
  ).all<SitemapRow>();

  // Use the most recent session date or current date for homepage lastmod
  const latestSessionDate = results.length > 0
    ? toW3CDate(results[0].updated_at).split('T')[0]
    : STATIC_PAGES[0].lastmod;

  const staticEntries = STATIC_PAGES.map(
    p => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${p.path === '/' ? latestSessionDate : p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join('\n');

  const dynamicEntries = results.map(
    row => `  <url>
    <loc>${SITE_URL}/session/${escapeXml(row.slug)}</loc>
    <lastmod>${toW3CDate(row.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${dynamicEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
