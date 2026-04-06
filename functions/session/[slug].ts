import { Env, SessionRow } from '../types';
import { SITE_URL, SITE_NAME } from '../lib/xml';
import { rewriteMetaTags, buildJsonLdTag } from '../lib/htmlRewriter';

export const onRequestGet: PagesFunction<Env> = async ({ params, env, request }) => {
  const slug = params.slug as string;

  // Query for published session only
  const row = await env.DB.prepare(
    'SELECT slug, title, author, description, featured_image, category, audio_url, duration_sec, published_at, updated_at, faq_items, status FROM sessions WHERE slug = ? AND status = ?'
  ).bind(slug, 'published').first<SessionRow>();

  // If not found or not published, fall through to the SPA
  if (!row) {
    return env.ASSETS.fetch(request);
  }

  // Fetch the built index.html
  const assetResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
  let html = await assetResponse.text();

  const sessionUrl = `${SITE_URL}/session/${row.slug}`;
  const rawImage = row.featured_image || '';
  const image = rawImage.startsWith('http') ? rawImage : rawImage ? `${SITE_URL}${rawImage}` : `${SITE_URL}/og-image.jpg`;

  // Build extra head content: article meta + JSON-LD
  const articleMeta = buildArticleMeta(row);
  const jsonLdScripts = buildJsonLd(row, sessionUrl, image);

  html = rewriteMetaTags(html, {
    title: `${row.title} | ${SITE_NAME}`,
    description: row.description || `Listen to ${row.title} by ${row.author}.`,
    canonical: sessionUrl,
    ogType: 'article',
    ogImage: image,
    extraHead: `${articleMeta}\n${jsonLdScripts}`,
  });

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};

function buildArticleMeta(row: SessionRow): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const tags: string[] = [];
  if (row.published_at) {
    tags.push(`<meta property="article:published_time" content="${row.published_at}" />`);
  }
  if (row.updated_at) {
    tags.push(`<meta property="article:modified_time" content="${row.updated_at}" />`);
  }
  if (row.category) {
    tags.push(`<meta property="article:section" content="${escape(row.category)}" />`);
  }
  if (row.author) {
    tags.push(`<meta property="article:author" content="${escape(row.author)}" />`);
  }
  return tags.join('\n');
}

function buildJsonLd(row: SessionRow, sessionUrl: string, image: string): string {
  const scripts: string[] = [];

  // Article schema
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: row.title,
    description: row.description,
    url: sessionUrl,
    image: image,
    ...(row.author && { author: { '@type': 'Person', name: row.author } }),
    ...(row.published_at && { datePublished: row.published_at }),
    ...(row.updated_at && { dateModified: row.updated_at }),
    ...(row.category && { articleSection: row.category }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon-192x192.png` },
    },
  };
  scripts.push(buildJsonLdTag(articleSchema));

  // AudioObject schema (if audio available)
  if (row.audio_url) {
    const audioSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'AudioObject',
      name: row.title,
      description: row.description,
      contentUrl: row.audio_url,
      encodingFormat: 'audio/mpeg',
      ...(row.duration_sec && { duration: `PT${Math.floor(row.duration_sec / 60)}M${row.duration_sec % 60}S` }),
      ...(row.published_at && { uploadDate: row.published_at }),
    };
    scripts.push(buildJsonLdTag(audioSchema));
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Sessions', item: `${SITE_URL}/sessions` },
      { '@type': 'ListItem', position: 3, name: row.title, item: sessionUrl },
    ],
  };
  scripts.push(buildJsonLdTag(breadcrumbSchema));

  // FAQ schema if present
  let faqItems: Array<{ question: string; answer: string }> = [];
  try {
    faqItems = row.faq_items ? JSON.parse(row.faq_items) : [];
  } catch { /* ignore */ }

  if (faqItems.length > 0) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems
        .filter(f => f.question && f.answer)
        .map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    };
    scripts.push(buildJsonLdTag(faqSchema));
  }

  return scripts.join('\n');
}
