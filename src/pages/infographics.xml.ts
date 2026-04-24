import type { APIContext } from 'astro';
import { SITE_URL, SITE_NAME, escapeXml, toRFC2822 } from '../lib/xml';
import { optimizedImageAbs } from '../lib/image';

interface FeedRow {
  slug: string;
  title: string;
  description: string;
  image_url: string;
  published_at: string;
}

const FEED_TITLE = `${SITE_NAME} — Infographics`;
const FEED_DESCRIPTION =
  'Mindfulness and meditation infographics — visual guides, stats, and practice summaries.';

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;

  const { results } = await db.prepare(
    "SELECT slug, title, description, image_url, published_at FROM infographics WHERE status = 'published' ORDER BY published_at DESC LIMIT 50"
  ).all<FeedRow>();

  const lastBuildDate = results.length > 0 ? toRFC2822(results[0].published_at) : new Date().toUTCString();

  const items = results.map(row => {
    const imageUrl = escapeXml(optimizedImageAbs(row.image_url, { width: 1200, fit: 'scale-down' }));
    const indexUrl = `${SITE_URL}/`;
    const slugGuid = `${SITE_URL}/infographic/${escapeXml(row.slug)}`;
    return `    <item>
      <title>${escapeXml(row.title)}</title>
      <description>${escapeXml(row.description || row.title)}</description>
      <link>${indexUrl}</link>
      <guid isPermaLink="false">${slugGuid}</guid>
      <pubDate>${toRFC2822(row.published_at)}</pubDate>
      <enclosure url="${imageUrl}" type="image/webp" length="0"/>
      <media:content url="${imageUrl}" medium="image"/>
      <media:thumbnail url="${imageUrl}"/>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <link>${SITE_URL}/infographics</link>
    <atom:link href="${SITE_URL}/infographics.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <image>
      <url>${SITE_URL}/favicon-192x192.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${SITE_URL}/infographics</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
