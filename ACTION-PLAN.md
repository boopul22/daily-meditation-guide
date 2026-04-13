# SEO Action Plan: dailymeditationguide.com

**Generated:** 2026-04-11
**Current Score:** 50/100
**Target Score:** 80/100

---

## Phase 1: Critical Fixes (Do Immediately)

Expected score impact: +12 points

### 1.1 Fix Article schema `datePublished` fallback
**File:** `src/pages/session/[slug].astro:67`
**Time:** 5 min

Add fallback so `datePublished` is never omitted:
```javascript
// Change conditional spread to always include datePublished
"datePublished": session.publishedAt || session.createdAt || new Date().toISOString(),
```

### 1.2 Remove FAQPage schema
**File:** `src/pages/session/[slug].astro:92-103`
**Time:** 2 min

Delete the FAQPage JSON-LD block. Google restricted FAQ rich results to government/healthcare authority sites in August 2023. This markup serves no SEO purpose.

### 1.3 Remove noindexed pages from sitemap
**File:** `src/pages/sitemap.xml.ts:14-16`
**Time:** 5 min

Remove `/privacy`, `/terms`, `/disclaimer` from the `STATIC_PAGES` array. Including noindexed URLs in a sitemap sends contradictory signals.

### 1.4 Add HSTS header
**File:** `public/_headers`
**Time:** 1 min

Add under the `/*` section:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 1.5 Fix session 404 status code
**File:** `src/pages/session/[slug].astro:11,22`
**Time:** 10 min

Replace `return Astro.redirect('/404')` with a proper 404 response that renders the 404 content with a 404 status code, instead of issuing a 302 redirect.

### 1.6 Downgrade eager hydration directives
**File:** `src/layouts/MainLayout.astro:66,75-76`
**Time:** 2 min

```diff
- <Navbar client:load />
+ <Navbar client:idle />

- <AudioManager client:load />
- <PlayerBar client:load />
+ <AudioManager client:idle />
+ <PlayerBar client:idle />
```

---

## Phase 2: High Priority (Week 1)

Expected score impact: +10 points

### 2.1 Self-host Google Fonts
**File:** `src/layouts/MainLayout.astro:57-62`
**Time:** 1-2 hours

1. Download Outfit, Playfair Display, Source Serif 4 from Google Fonts
2. Subset to Latin characters only (reduces file size 50-70%)
3. Convert to WOFF2 format
4. Place in `public/fonts/`
5. Create `@font-face` declarations in `globals.css` with `font-display: optional`
6. Remove the Google Fonts `<link>` tags and preconnect hints

### 2.2 Replace Iconify CDN with build-time icons
**File:** `src/layouts/MainLayout.astro:56`
**Time:** 2-3 hours

1. Install `astro-icon` or `@iconify/json` package
2. Replace all `<iconify-icon>` web components with inline SVG imports
3. Remove the Iconify CDN script tag
4. Eliminates runtime network requests for every icon on every page

### 2.3 Add Organization schema globally
**File:** `src/layouts/MainLayout.astro`
**Time:** 15 min

Add JSON-LD to the layout head:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Daily Meditation Guide",
  "url": "https://dailymeditationguide.com",
  "logo": "https://dailymeditationguide.com/favicon-192x192.png",
  "description": "Your daily guide to mindfulness and meditation.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "contact@dailymeditationguide.com"
  }
}
```

### 2.4 Fix or remove SearchAction schema
**File:** `src/pages/index.astro:24-30`
**Time:** 5 min (remove) or 2-4 hours (implement search)

If no site search exists, remove the SearchAction block from the WebSite schema. Misleading structured data can harm trust.

### 2.5 Add Contact to main navigation
**File:** `src/components/Navbar.tsx:42-46`
**Time:** 5 min

Add "Contact" link to the navigation items array.

---

## Phase 3: Content & E-E-A-T (Weeks 2-4)

Expected score impact: +15 points

### 3.1 Add homepage body content
**File:** `src/pages/index.astro`
**Time:** 2-3 hours

Add a static content section below the hero with 300-500 words:
- What Daily Meditation Guide offers
- Types of sessions (Sleep, Anxiety, Focus, Nature Sounds)
- Who it's for and how to get started
- Include primary keywords naturally in H1 and H2s

Revise H1 from "Find stillness in the noise" to include target keywords, e.g., "Guided Meditation Sessions for Sleep, Focus & Calm"

### 3.2 Establish meditation expertise on About page
**File:** `src/pages/about.astro`
**Time:** 2-3 hours

- Add personal meditation practice history/journey
- Document any training, courses, or certifications
- Replace or reduce developer-focused "What I Do" and "My Other Projects" sections
- Add a "Why I'm Qualified" or "My Meditation Journey" section
- Reference any partnerships with wellness professionals

### 3.3 Create category landing pages
**New files:** `src/pages/category/[slug].astro`
**Time:** 1-2 days

Create indexable pages at:
- `/category/sleep` -- 800+ words on meditation for sleep
- `/category/anxiety` -- 800+ words on meditation for anxiety
- `/category/focus` -- 800+ words on meditation for focus
- `/category/nature-sounds` -- 800+ words on nature sound meditation

Each page should include:
- Expert-level explanatory content with research citations
- Filtered session listings
- Internal links to individual sessions
- BreadcrumbList schema
- Unique meta titles and descriptions

### 3.4 Build author profile system
**Files:** `src/types.ts`, new `src/pages/author/[slug].astro`
**Time:** 1-2 days

1. Expand Author from plain string to full entity with bio, credentials, photo, social links
2. Create `/author/[slug]` pages with ProfilePage + Person schema
3. Enrich Article JSON-LD author with `url`, `sameAs`, `jobTitle`
4. Display real author photos instead of gradient placeholders

### 3.5 Add visible breadcrumbs
**File:** New `src/components/Breadcrumb.astro`
**Time:** 1-2 hours

Create a visible breadcrumb component and add to session detail and category pages. JSON-LD already exists but users and crawlers benefit from visible navigation.

### 3.6 Display dates in session UI
**File:** `src/components/DetailInteractive.tsx`
**Time:** 30 min

Show `publishedAt` and `updatedAt` dates in the article header alongside author name.

---

## Phase 4: Performance Optimization (Weeks 2-3)

Expected score impact: +8 points

### 4.1 Switch to hybrid output mode
**File:** `astro.config.mjs`
**Time:** 2-4 hours

```diff
- output: 'server',
+ output: 'hybrid',
```

Add `prerender = true` to `index.astro` and `sessions.astro`. Consider prerendering session detail pages with `getStaticPaths()`.

### 4.2 Add responsive images
**Files:** All components with `<img>` tags
**Time:** 1 day

1. Integrate Cloudflare Image Resizing for on-the-fly responsive variants
2. Add `srcset` with 400w, 800w, 1200w breakpoints
3. Add appropriate `sizes` attributes
4. Negotiate WebP/AVIF via `Accept` header in image API

### 4.3 Preload hero LCP image
**File:** `src/pages/index.astro`
**Time:** 15 min

Add to `extraHead`:
```html
<link rel="preload" as="image" href="${latestSession.featuredImage}" fetchpriority="high" />
```

### 4.4 Break up DetailInteractive into smaller islands
**File:** `src/pages/session/[slug].astro`, `src/components/DetailInteractive.tsx`
**Time:** 3-4 hours

- Render article body directly in Astro template (no React hydration needed)
- Keep play button as small `client:idle` React island
- Convert FAQ accordion to `<details>` HTML element (zero JS)
- Keep TOC as `client:visible` for scroll-spy only

### 4.5 Fix skeleton height mismatch
**File:** `src/components/SessionCardSkeleton.tsx:4`
**Time:** 2 min

Change `h-48` to `h-[19rem]` to match `SessionCard.tsx:26`.

### 4.6 Expand _routes.json exclusions
**File:** `public/_routes.json`
**Time:** 5 min

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_astro/*",
    "/favicon.ico",
    "/favicon-*.png",
    "/apple-touch-icon.png",
    "/robots.txt",
    "/og-image.*",
    "/noise.svg"
  ]
}
```

---

## Phase 5: Schema Enrichment (Week 3)

Expected score impact: +5 points

### 5.1 Add VideoObject schema for YouTube content
**File:** `src/pages/sessions.astro`
**Time:** 1-2 hours

Add ItemList with VideoObject items for all 147 YouTube videos. Include `name`, `thumbnailUrl`, `uploadDate`, `contentUrl`, `embedUrl`.

### 5.2 Add AudioObject to session detail
**File:** `src/pages/session/[slug].astro`
**Time:** 30 min

Add `audio` property to the Article JSON-LD with `contentUrl`, `duration`, `encodingFormat`.

### 5.3 Add schema to About and Contact pages
**Files:** `src/pages/about.astro`, `src/pages/contact.astro`
**Time:** 30 min

- About: ProfilePage + Person + BreadcrumbList
- Contact: ContactPage + BreadcrumbList

### 5.4 Add `mainEntityOfPage` to Article schema
**File:** `src/pages/session/[slug].astro`
**Time:** 2 min

Add `"mainEntityOfPage": pageUrl` to the Article JSON-LD object.

---

## Phase 6: Polish (Month 2)

Expected score impact: +3 points

### 6.1 Set up domain-matched email
Replace `blog.boopul@gmail.com` with `contact@dailymeditationguide.com` across:
- `about.astro:34`
- `contact.astro:40`
- `privacy.astro:109`

### 6.2 Fix placeholder social links
Replace all `#` links with real social media URLs in `about.astro:30-34` and `contact.astro`.

### 6.3 Add AI crawler rules to robots.txt
Decide on policy and add directives for GPTBot, CCBot, ClaudeBot, etc.

### 6.4 Implement Content-Security-Policy
Start with report-only mode, then enforce.

### 6.5 Fix legal page heading hierarchy
Change H3s to H2s in `privacy.astro`, `terms.astro`, `disclaimer.astro`.

### 6.6 Add `trailingSlash: 'never'` to Astro config
Enforce canonical URL form.

### 6.7 Clean up sitemap
- Remove deprecated `<changefreq>` and `<priority>` tags
- Use real lastmod dates per page instead of blanket date
- Centralize SITE_URL imports (hardcoded in 4 files)

---

## Score Projection

| Phase | Issues Fixed | Projected Score |
|-------|-------------|----------------|
| Current | -- | 50/100 |
| Phase 1 (Critical) | 6 | 62/100 |
| Phase 2 (High Priority) | 5 | 72/100 |
| Phase 3 (Content & E-E-A-T) | 6 | 82/100 |
| Phase 4 (Performance) | 6 | 87/100 |
| Phase 5 (Schema) | 4 | 90/100 |
| Phase 6 (Polish) | 7 | 93/100 |
