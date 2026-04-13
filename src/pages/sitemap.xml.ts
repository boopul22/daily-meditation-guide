import type { APIContext } from 'astro';
import { SITE_URL, escapeXml, toW3CDate } from '../lib/xml';

interface SitemapRow {
  slug: string;
  updated_at: string;
}

const STATIC_PAGES = [
  { path: '/', lastmod: '2026-04-13' },
  { path: '/sessions', lastmod: '2026-04-13' },
  { path: '/infographics', lastmod: '2026-04-13' },
  { path: '/about', lastmod: '2026-04-13' },
  { path: '/contact', lastmod: '2026-04-13' },
];

const INFOGRAPHICS_PAGE_SIZE = 24;

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;

  const [sessionsRes, infographicsRes] = await Promise.all([
    db.prepare(
      "SELECT slug, updated_at FROM sessions WHERE status = 'published' ORDER BY published_at DESC"
    ).all<SitemapRow>(),
    db.prepare(
      "SELECT slug, updated_at FROM infographics WHERE status = 'published' ORDER BY published_at DESC"
    ).all<SitemapRow>(),
  ]);

  const sessions = sessionsRes.results || [];
  const infographics = infographicsRes.results || [];

  const latestDate = sessions.length > 0
    ? toW3CDate(sessions[0].updated_at).split('T')[0]
    : STATIC_PAGES[0].lastmod;

  const staticEntries = STATIC_PAGES.map(
    p => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${p.path === '/' ? latestDate : p.lastmod}</lastmod>
  </url>`
  ).join('\n');

  const sessionEntries = sessions.map(
    row => `  <url>
    <loc>${SITE_URL}/session/${escapeXml(row.slug)}</loc>
    <lastmod>${toW3CDate(row.updated_at)}</lastmod>
  </url>`
  ).join('\n');

  const infographicEntries = infographics.map(
    row => `  <url>
    <loc>${SITE_URL}/infographic/${escapeXml(row.slug)}</loc>
    <lastmod>${toW3CDate(row.updated_at)}</lastmod>
  </url>`
  ).join('\n');

  // Paginated infographics listing pages (page 2..N)
  const totalPages = Math.max(1, Math.ceil(infographics.length / INFOGRAPHICS_PAGE_SIZE));
  const infographicPages: string[] = [];
  for (let p = 2; p <= totalPages; p++) {
    infographicPages.push(`  <url>
    <loc>${SITE_URL}/infographics/page/${p}</loc>
    <lastmod>${latestDate}</lastmod>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${sessionEntries}
${infographicEntries}
${infographicPages.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
