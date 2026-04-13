import type { APIContext } from 'astro';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, escapeXml, toRFC2822 } from '../lib/xml';

interface FeedRow {
  slug: string;
  title: string;
  author: string;
  description: string;
  category: string;
  published_at: string;
  featured_image: string;
}

function absoluteImage(src: string): string {
  if (!src) return `${SITE_URL}/meditation.png`;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;

  const { results } = await db.prepare(
    "SELECT slug, title, author, description, category, published_at, featured_image FROM sessions WHERE status = 'published' ORDER BY published_at DESC LIMIT 50"
  ).all<FeedRow>();

  const lastBuildDate = results.length > 0 ? toRFC2822(results[0].published_at) : new Date().toUTCString();

  const items = results.map(row => {
    const imageUrl = escapeXml(absoluteImage(row.featured_image));
    return `    <item>
      <title>${escapeXml(row.title)}</title>
      <description>${escapeXml(row.description)}</description>
      <link>${SITE_URL}/session/${escapeXml(row.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/session/${escapeXml(row.slug)}</guid>
      <pubDate>${toRFC2822(row.published_at)}</pubDate>
      <category>${escapeXml(row.category)}</category>
      <author>${escapeXml(row.author)}</author>
      <enclosure url="${imageUrl}" type="image/jpeg" length="0"/>
      <media:content url="${imageUrl}" medium="image"/>
      <media:thumbnail url="${imageUrl}"/>
    </item>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <image>
      <url>${SITE_URL}/favicon-192x192.png</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${SITE_URL}</link>
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
