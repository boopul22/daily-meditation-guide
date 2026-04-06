import { SITE_URL, SITE_NAME } from './xml';

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  twitterImage?: string;
  extraHead?: string; // Additional tags to inject before </head>
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Rewrite meta tags in the base index.html with page-specific values.
 * Works by replacing the hardcoded defaults from index.html.
 */
export function rewriteMetaTags(html: string, meta: PageMeta): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonical = meta.canonical;
  const ogType = meta.ogType || 'website';
  const ogImage = meta.ogImage || `${SITE_URL}/og-image.jpg`;
  const twitterImage = meta.twitterImage || ogImage;

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
    `<meta property="og:type" content="${ogType}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escapeHtml(twitterImage)}" />`
  );

  if (meta.extraHead) {
    html = html.replace('</head>', `${meta.extraHead}\n</head>`);
  }

  return html;
}

/**
 * Build a JSON-LD script tag from a schema object.
 */
export function buildJsonLdTag(schema: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}
