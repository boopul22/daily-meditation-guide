import type { APIContext } from 'astro';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, escapeXml, toRFC2822 } from '../lib/xml';
import { optimizedImageAbs } from '../lib/image';

interface FeedRow {
  slug: string;
  title: string;
  author: string;
  description: string;
  category: string;
  published_at: string;
  featured_image: string;
}

interface VideoRow {
  video_id: string;
  slug: string;
  title: string;
  description: string;
  published_at: string;
}

export async function GET(context: APIContext) {
  const db = context.locals.runtime.env.DB;

  const [sessionsRes, videosRes] = await Promise.all([
    db.prepare(
      "SELECT slug, title, author, description, category, published_at, featured_image FROM sessions WHERE status = 'published' ORDER BY published_at DESC LIMIT 50"
    ).all<FeedRow>(),
    db.prepare(
      "SELECT video_id, slug, title, description, published_at FROM youtube_videos WHERE slug != '' ORDER BY published_at DESC LIMIT 50"
    ).all<VideoRow>(),
  ]);

  const sessions = sessionsRes.results || [];
  const videos = videosRes.results || [];

  type FeedEntry = { published_at: string; xml: string };
  const entries: FeedEntry[] = [];

  for (const row of sessions) {
    const imageUrl = escapeXml(optimizedImageAbs(row.featured_image, { width: 1200 }));
    entries.push({
      published_at: row.published_at,
      xml: `    <item>
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
    </item>`,
    });
  }

  for (const row of videos) {
    const imageUrl = escapeXml(`https://img.youtube.com/vi/${row.video_id}/hqdefault.jpg`);
    entries.push({
      published_at: row.published_at,
      xml: `    <item>
      <title>${escapeXml(row.title)}</title>
      <description>${escapeXml(row.description || '')}</description>
      <link>${SITE_URL}/video-sessions/${escapeXml(row.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/video-sessions/${escapeXml(row.slug)}</guid>
      <pubDate>${toRFC2822(row.published_at)}</pubDate>
      <category>Video</category>
      <enclosure url="${imageUrl}" type="image/jpeg" length="0"/>
      <media:content url="${imageUrl}" medium="image"/>
      <media:thumbnail url="${imageUrl}"/>
    </item>`,
    });
  }

  entries.sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
  const limited = entries.slice(0, 50);

  const lastBuildDate = limited.length > 0 ? toRFC2822(limited[0].published_at) : new Date().toUTCString();
  const items = limited.map(e => e.xml).join('\n');

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
