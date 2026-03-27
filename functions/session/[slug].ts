import { Env, SessionRow } from '../types';
import { SITE_URL, SITE_NAME, escapeXml } from '../lib/xml';

export const onRequestGet: PagesFunction<Env> = async ({ params, env, request }) => {
  const slug = params.slug as string;

  // Query for published session only
  const row = await env.DB.prepare(
    'SELECT slug, title, author, description, featured_image, category, published_at, updated_at, faq_items, status FROM sessions WHERE slug = ? AND status = ?'
  ).bind(slug, 'published').first<SessionRow>();

  // If not found or not published, fall through to the SPA
  if (!row) {
    return env.ASSETS.fetch(request);
  }

  // Fetch the built index.html
  const assetResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url)));
  let html = await assetResponse.text();

  const sessionUrl = `${SITE_URL}/session/${row.slug}`;
  const title = `${escapeHtml(row.title)} | ${SITE_NAME}`;
  const description = escapeHtml(row.description || `Listen to ${row.title} by ${row.author}.`);
  const rawImage = row.featured_image || '';
  const image = rawImage.startsWith('http') ? rawImage : rawImage ? `${SITE_URL}${rawImage}` : `${SITE_URL}/og-image.jpg`;
  const canonical = sessionUrl;

  // Replace hardcoded homepage meta tags with session-specific ones
  html = html.replace(
    /<title>Daily Meditation Guide<\/title>/,
    `<title>${title}</title>`
  );
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = html.replace(
    /<meta property="og:type" content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="article" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${sessionUrl}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeHtml(image)}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`
  );

  // Inject additional meta tags + JSON-LD before </head>
  const articleMeta = buildArticleMeta(row);
  const jsonLdScripts = buildJsonLd(row, sessionUrl, image);
  html = html.replace('</head>', `${articleMeta}\n${jsonLdScripts}\n</head>`);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildArticleMeta(row: SessionRow): string {
  const tags: string[] = [];
  if (row.published_at) {
    tags.push(`<meta property="article:published_time" content="${row.published_at}" />`);
  }
  if (row.updated_at) {
    tags.push(`<meta property="article:modified_time" content="${row.updated_at}" />`);
  }
  if (row.category) {
    tags.push(`<meta property="article:section" content="${escapeHtml(row.category)}" />`);
  }
  if (row.author) {
    tags.push(`<meta property="article:author" content="${escapeHtml(row.author)}" />`);
  }
  return tags.join('\n');
}

function buildJsonLd(row: SessionRow, sessionUrl: string, image: string): string {
  const articleSchema = {
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Sessions', item: `${SITE_URL}/sessions` },
      { '@type': 'ListItem', position: 3, name: row.title, item: sessionUrl },
    ],
  };

  let scripts = `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>\n`;
  scripts += `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;

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
    scripts += `\n<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
  }

  return scripts;
}
