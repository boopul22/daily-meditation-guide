import { Env } from './types';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './lib/xml';
import { rewriteMetaTags, buildJsonLdTag, PageMeta } from './lib/htmlRewriter';

interface StaticPageConfig extends PageMeta {
  jsonLd?: Record<string, unknown>[];
  noindex?: boolean;
}

const STATIC_PAGES: Record<string, StaticPageConfig> = {
  '/': {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    canonical: `${SITE_URL}/`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/sessions?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  },
  '/sessions': {
    title: `Guided Sessions | ${SITE_NAME}`,
    description: 'Explore our library of guided meditation sessions. Find sessions for focus, sleep, stress relief, and mindfulness.',
    canonical: `${SITE_URL}/sessions`,
  },
  '/about': {
    title: `About | ${SITE_NAME}`,
    description: 'Learn about Daily Meditation Guide — our mission to make mindfulness accessible through curated audio journeys.',
    canonical: `${SITE_URL}/about`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon-192x192.png`,
        description: SITE_DESCRIPTION,
        sameAs: [],
      },
    ],
  },
  '/contact': {
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Get in touch with the Daily Meditation Guide team. We\'d love to hear from you.',
    canonical: `${SITE_URL}/contact`,
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'Privacy policy for Daily Meditation Guide.',
    canonical: `${SITE_URL}/privacy`,
    noindex: true,
  },
  '/terms': {
    title: `Terms of Service | ${SITE_NAME}`,
    description: 'Terms of service for Daily Meditation Guide.',
    canonical: `${SITE_URL}/terms`,
    noindex: true,
  },
  '/disclaimer': {
    title: `Disclaimer | ${SITE_NAME}`,
    description: 'Disclaimer for Daily Meditation Guide.',
    canonical: `${SITE_URL}/disclaimer`,
    noindex: true,
  },
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Only intercept known static page paths (exact match)
  const pageConfig = STATIC_PAGES[path];
  if (!pageConfig) {
    return context.next();
  }

  // Let the request pass through to get the SPA HTML
  const response = await context.next();

  // Only rewrite HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  // Build extra head content
  const extraParts: string[] = [];

  if (pageConfig.noindex) {
    extraParts.push('<meta name="robots" content="noindex, nofollow" />');
  }

  if (pageConfig.jsonLd) {
    for (const schema of pageConfig.jsonLd) {
      extraParts.push(buildJsonLdTag(schema));
    }
  }

  html = rewriteMetaTags(html, {
    ...pageConfig,
    extraHead: extraParts.length > 0 ? extraParts.join('\n') : undefined,
  });

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Content-Type', 'text/html; charset=utf-8');

  return new Response(html, {
    status: response.status,
    headers: newHeaders,
  });
};
