# Full SEO Audit Report: dailymeditationguide.com

**Audit Date:** 2026-04-11
**Framework:** Astro 5.10.2 + React 18 (Cloudflare Workers)
**Domain:** https://dailymeditationguide.com
**Business Type:** Meditation / Mindfulness / Wellness (YMYL)

---

## Executive Summary

### Overall SEO Health Score: 50/100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 74 | 18.5 |
| Content Quality & E-E-A-T | 25% | 38 | 9.5 |
| On-Page SEO | 20% | 50 | 10.0 |
| Schema / Structured Data | 10% | 55 | 5.5 |
| Performance (CWV) | 10% | 35 | 3.5 |
| Images | 5% | 30 | 1.5 |
| AI Search Readiness | 5% | 30 | 1.5 |
| **Total** | | | **50/100** |

### Top 5 Critical Issues

1. **No meditation expertise or credentials anywhere on the site** -- Fatal for a YMYL health/wellness site. The About page positions the creator as a developer, not a wellness professional.
2. **Homepage has ~45 words of static content** -- No primary keywords ("meditation," "guided meditation") in H1. Near-zero crawlable body content.
3. **Render-blocking Google Fonts (3 families, 15 variants)** -- Directly delays LCP by 300-800ms on every page load.
4. **FAQPage schema restricted to govt/health authority sites** -- Will never generate rich results. Dead markup since August 2023.
5. **Article `datePublished` conditionally omitted** -- Google requires this for Article rich results. Sessions without `publishedAt` fail validation.

### Top 5 Quick Wins

1. Remove 3 noindexed pages (`/privacy`, `/terms`, `/disclaimer`) from sitemap -- 5 min fix
2. Change `client:load` to `client:idle` on Navbar, AudioManager, PlayerBar -- 2 min fix
3. Remove FAQPage schema from session detail pages -- 2 min fix
4. Add `datePublished` fallback to `createdAt` in Article schema -- 5 min fix
5. Add HSTS header to `_headers` file -- 1 min fix

---

## 1. Technical SEO (74/100)

### Crawlability

| Check | Status | File | Notes |
|-------|--------|------|-------|
| robots.txt | PASS | `public/robots.txt` | Correct allow/disallow, sitemap declared |
| Middleware X-Robots-Tag | PASS | `src/middleware.ts:14-25` | Public pages indexed, admin/API noindexed |
| _headers edge config | PASS | `public/_headers` | Mirrors middleware logic correctly |
| _routes.json | PASS | `public/_routes.json` | Standard Cloudflare Pages pattern |

**Issues:**

- **[Medium]** No AI crawler rules in `robots.txt`. No directives for `GPTBot`, `CCBot`, `ClaudeBot`, `PerplexityBot`, etc. Original editorial content is unprotected from AI training scrapers.
  - File: `public/robots.txt`

### Indexability

| Check | Status | File | Notes |
|-------|--------|------|-------|
| Canonical tags | PASS | `src/layouts/MainLayout.astro:39` | Every page has explicit canonical |
| Meta robots / noindex | PASS | `src/layouts/MainLayout.astro:40` | Correctly applied to legal pages + 404 |
| HTML lang attribute | PASS | `src/layouts/MainLayout.astro:33` | `lang="en"` set |

**Issues:**

- **[Low]** Default canonical fallback is root URL (`MainLayout.astro:24`). Any page that forgets to pass `canonical` silently canonicalizes to homepage.

### Security Headers

| Header | Status | Notes |
|--------|--------|-------|
| X-Content-Type-Options: nosniff | PASS | `_headers:3`, `middleware.ts:9` |
| X-Frame-Options: SAMEORIGIN | PASS | `_headers:4`, `middleware.ts:10` |
| Referrer-Policy: strict-origin-when-cross-origin | PASS | `_headers:5`, `middleware.ts:11` |
| Permissions-Policy | PASS | `_headers:6` |
| Strict-Transport-Security (HSTS) | **FAIL** | Not set anywhere |
| Content-Security-Policy (CSP) | **FAIL** | Not set anywhere |

**Issues:**

- **[High]** Missing HSTS header. Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to `_headers`.
- **[Medium]** Missing CSP. The site loads scripts from `code.iconify.design` and fonts from `fonts.googleapis.com` with no CSP boundary.

### URL Structure

| Check | Status | Notes |
|-------|--------|-------|
| Clean URLs | PASS | All lowercase, no extensions, no trailing slashes |
| Dynamic routes | PASS | `/session/[slug]` uses clean slug pattern |

**Issues:**

- **[Medium]** Session 404 uses `Astro.redirect('/404')` which sends a 302 redirect instead of returning a proper 404 status code. Search engines will follow the redirect and potentially index `/404` as a real page.
  - File: `src/pages/session/[slug].astro:11,22`
- **[Low]** No `trailingSlash: 'never'` in `astro.config.mjs`. Both `/sessions` and `/sessions/` could resolve.

### JavaScript Rendering (SSR)

| Check | Status | Notes |
|-------|--------|-------|
| Server-rendered content | PASS | Sessions page has full SSR grid with all links |
| Structured data server-rendered | PASS | All JSON-LD in Astro template, not React |
| Meta tags server-rendered | PASS | All in MainLayout.astro head |

**Issues:**

- **[High]** Article body rendered inside `client:load` React component (`DetailInteractive.tsx:149`). Content IS in initial HTML (Astro SSR), but if hydration fails, content disappears. Should render article body directly in Astro template.

---

## 2. Content Quality & E-E-A-T (38/100)

### YMYL Classification: YES -- Health & Wellness

This site addresses anxiety, sleep, focus, and stress management, placing it firmly in Google's YMYL category. Heightened E-E-A-T standards apply.

### E-E-A-T Breakdown

| Factor | Weight | Score | Key Gap |
|--------|--------|-------|---------|
| Experience | 20% | 22/100 | Zero meditation practice history documented |
| Expertise | 25% | 18/100 | Creator positioned as developer, not wellness professional |
| Authoritativeness | 25% | 20/100 | No research citations, no expert endorsements |
| Trustworthiness | 30% | 35/100 | Legal pages exist but Gmail contact, placeholder social links |
| **Weighted E-E-A-T** | | **24/100** | |

### Critical Content Issues

1. **No meditation credentials** -- `about.astro:62-98` introduces "an indie developer and designer from India" with skills in "Apps & Tools," "AI Workflows," "Digital Assets." Zero mention of meditation training, personal practice, or wellness qualifications.

2. **Homepage thin content** -- `index.astro:46-107` has ~45 words of static body text. H1 is "Find stillness in the noise" -- poetic but contains no target keywords. No introductory content about meditation types, benefits, or how to get started.

3. **No author profile system** -- `types.ts:18-19` stores author as plain string. No Author entity, no author pages, no linked credentials, no "reviewed by" attribution. `DetailInteractive.tsx:79` renders a generic gradient circle instead of a real photo.

4. **No research citations** -- The site claims to help with sleep, anxiety, and focus but provides zero links to peer-reviewed studies, NIH, or Mayo Clinic references.

### Content Depth

| Page | Static Words | Minimum | Verdict |
|------|-------------|---------|---------|
| Homepage | ~45 | 500 | CRITICAL -- thin content |
| Sessions listing | ~35 | 500 | HIGH -- thin content |
| About | ~400 | 500 | MEDIUM -- borderline, off-topic |
| Session detail | Dynamic | 1,500 | Depends on CMS content |
| Contact | ~50 | N/A | Acceptable for contact page |

### Heading Hierarchy Issues

- **Homepage:** H1 "Find stillness in the noise" lacks keywords. Single H2 inside React component.
- **About:** H1 "Hi, I'm Bipul Kumar" not optimized for site topic.
- **Legal pages:** All skip H2, jumping from H1 directly to H3 (`privacy.astro:38`, `terms.astro:34`, `disclaimer.astro:39`).
- **Session detail:** Good hierarchy with H1 title, H2/H3 from content, H2 FAQ.

### Internal Linking Gaps

- **[High]** Contact page not in main navigation (`Navbar.tsx:42-46`). Only accessible through footer.
- **[High]** No category landing pages. Categories (Sleep, Anxiety, Focus, Nature Sounds) are client-side filters with no indexable URLs.
- **[Medium]** Breadcrumb JSON-LD exists but no visible breadcrumb UI is rendered.
- **[Medium]** No contextual interlinking between sessions. "Related Sessions" depends on database population.

### Trust Signal Gaps

- **[Medium]** Contact email is personal Gmail (`blog.boopul@gmail.com`) not domain-matched.
- **[Medium]** Social links on About page (`about.astro:30-34`) and Contact page (`contact.astro:50,57`) point to `#` placeholders.
- **[Medium]** Contact form uses `mailto:` redirect (`ContactForm.tsx:13`) instead of server submission.
- **[Medium]** Dates not visible in UI on session pages despite existing in schema.

---

## 3. On-Page SEO (50/100)

### Title Tags

| Page | Title | Assessment |
|------|-------|------------|
| Homepage | "Daily Meditation Guide" | Missing descriptors like "Guided Sessions" |
| Sessions | "Guided Meditation Sessions \| Daily Meditation Guide" | Good |
| Session detail | "[Title] \| Daily Meditation Guide" | Good |
| About | "About \| Daily Meditation Guide" | Could include "Meditation" |
| Contact | "Contact Us \| Daily Meditation Guide" | Acceptable |

### Meta Descriptions

- All pages have meta descriptions -- PASS
- Homepage and sessions page descriptions contain target keywords -- PASS
- **[Medium]** Sessions page meta description closely mirrors H1 subtext (template-driven, not crafted)

### Open Graph / Social

| Check | Status | Notes |
|-------|--------|-------|
| OG image | PASS | `og-image.jpg` (1152x864) + WebP variant |
| OG title/description | PASS | Set per page |
| Twitter card | PASS | `summary_large_image` |
| RSS feed discovery | PASS | `<link rel="alternate">` in head |

---

## 4. Schema & Structured Data (55/100)

### Existing Schema (Validated)

| Page | Schema Types | Status |
|------|-------------|--------|
| Homepage | WebSite + SearchAction | PASS (with caveats) |
| Sessions | CollectionPage + ItemList + BreadcrumbList | PASS |
| Session detail | Article + BreadcrumbList + FAQPage | MIXED |
| About | None | FAIL |
| Contact | None | FAIL |
| Layout (global) | None | FAIL |

### Critical Schema Issues

1. **[Critical]** FAQPage schema (`session/[slug].astro:92-103`) restricted to government/healthcare authority sites since August 2023. Will never generate rich results. Remove.

2. **[Critical]** `datePublished` conditionally omitted from Article schema (`session/[slug].astro:67`). Google **requires** this for Article rich results. Add fallback to `createdAt`.

3. **[High]** No Organization schema anywhere. Add to `MainLayout.astro` globally for knowledge panel eligibility.

4. **[High]** 147 YouTube videos (`src/data/youtubeVideos.ts`) have no VideoObject schema. Major missed opportunity for video rich results.

5. **[High]** SearchAction target URL (`/?q={search_term_string}`) may not have working search functionality. Navbar search button (`Navbar.tsx:49-51`) is non-functional.

### Missing Schema Opportunities

| Schema Type | Priority | Where to Add |
|-------------|----------|-------------|
| Organization | HIGH | `MainLayout.astro` (global) |
| VideoObject (147 videos) | HIGH | `sessions.astro` |
| AudioObject | MEDIUM | `session/[slug].astro` |
| ProfilePage + Person | MEDIUM | `about.astro` |
| ContactPage | LOW | `contact.astro` |
| SiteNavigationElement | LOW | `MainLayout.astro` |
| BreadcrumbList (about, contact) | LOW | `about.astro`, `contact.astro` |

---

## 5. Performance / Core Web Vitals (35/100)

### LCP (Largest Contentful Paint) -- Estimated: POOR (>4.0s on 3G)

| Issue | Severity | Est. Impact |
|-------|----------|-------------|
| 3 render-blocking Google Font families (15 variants) | CRITICAL | +300-800ms |
| Iconify CDN script + runtime icon fetching | CRITICAL | +50-150ms |
| All core pages SSR instead of SSG | CRITICAL | +50-200ms TTFB |
| No `<link rel="preload">` for hero image | HIGH | +100-300ms |
| No responsive images (srcset/sizes) | HIGH | +200-500ms mobile |

### INP (Interaction to Next Paint) -- Estimated: NEEDS IMPROVEMENT

| Issue | Severity | Est. Impact |
|-------|----------|-------------|
| Iconify runtime icon fetching (28+ icons/page) | CRITICAL | Cumulative main thread |
| Navbar `client:load` forces React on critical path | HIGH | ~40KB React runtime parse |
| AudioManager + PlayerBar `client:load` (render nothing) | HIGH | Unnecessary hydration |
| HomeContent full grid in React | MEDIUM | Large DOM tree hydration |
| DetailInteractive wraps entire article in React | MEDIUM | Full-page React hydration |

### CLS (Cumulative Layout Shift) -- Estimated: GOOD (<0.1)

| Issue | Severity | Est. Impact |
|-------|----------|-------------|
| Google Fonts `display=swap` (FOUT) | MEDIUM | Font swap shift |
| Skeleton height mismatch (192px vs 304px) | LOW | ~0.05 per card |
| PlayerBar image missing width/height | LOW | Mitigated by absolute positioning |

### Performance Recommendations (by Impact)

1. **Self-host and subset Google Fonts** -- Expected LCP: -300-600ms
2. **Replace Iconify CDN with build-time SVGs** -- Expected LCP: -100-300ms, INP: significant
3. **Switch to `output: 'hybrid'`**, prerender homepage/sessions -- Expected TTFB: -50-200ms
4. **Add responsive images with srcset** + Cloudflare Image Resizing -- Expected mobile LCP: -200-500ms
5. **Downgrade `client:load` to `client:idle`** on Navbar, AudioManager, PlayerBar -- Expected INP: -100-300ms

---

## 6. Sitemap (70/100)

### Structure

| Check | Status |
|-------|--------|
| Valid XML namespace | PASS |
| Correct content-type | PASS |
| Cache-control headers | PASS |
| XML escaping for slugs | PASS |
| Published sessions only | PASS |
| Admin/API excluded | PASS |

### Issues

- **[High]** 3 noindexed pages in sitemap: `/privacy`, `/terms`, `/disclaimer` are `noindex={true}` but listed in sitemap (`sitemap.xml.ts:14-16`). Contradictory signals.
- **[Low]** All 7 static pages share identical `lastmod: '2026-04-07'` -- makes dates unreliable.
- **[Low]** Inconsistent lastmod format: static pages use date-only, dynamic use full ISO datetime.
- **[Info]** `<changefreq>` and `<priority>` tags ignored by Google since 2023. Can be removed.
- **[Info]** No `<link rel="sitemap">` in HTML head (robots.txt declaration is sufficient).

---

## 7. Images (30/100)

| Check | Status | Notes |
|-------|--------|-------|
| Alt text on session cards | PASS | `SessionCard.tsx` includes alt |
| OG image exists | PASS | 1152x864 JPG + WebP |
| Favicon set complete | PASS | ico + PNG variants + apple-touch-icon |
| Responsive images (srcset/sizes) | **FAIL** | Not used anywhere |
| Image format negotiation | **FAIL** | No server-side WebP/AVIF |
| Image preloading | **FAIL** | No preload for hero/LCP image |
| Lazy loading | PARTIAL | Used on some images, not consistently |

---

## 8. AI Search Readiness (30/100)

| Signal | Status | Notes |
|--------|--------|-------|
| Article JSON-LD | PASS | Good for AI extraction |
| FAQ JSON-LD | PASS (syntax) | But restricted by Google |
| Quotable definitions | **FAIL** | No "what is meditation" content |
| Research citations | **FAIL** | No links to studies |
| Clear hierarchy with anchors | PASS | TOC generates anchor links |
| Category explanatory content | **FAIL** | No category landing pages |
| Author expertise signals | **FAIL** | Minimal author schema |

---

## All Issues by Severity

### Critical (7 issues)

| # | Category | Issue | File |
|---|----------|-------|------|
| 1 | E-E-A-T | No meditation expertise/credentials on site | `about.astro:62-98` |
| 2 | Content | Homepage has ~45 words, no keywords in H1 | `index.astro:46-107` |
| 3 | Performance | Render-blocking Google Fonts (3 families, 15 variants) | `MainLayout.astro:57-62` |
| 4 | Performance | Iconify CDN script + runtime icon fetching | `MainLayout.astro:56` |
| 5 | Performance | All core pages SSR instead of SSG | `astro.config.mjs:7` |
| 6 | Schema | FAQPage schema will never generate rich results | `session/[slug].astro:92-103` |
| 7 | Schema | `datePublished` conditionally omitted from Article | `session/[slug].astro:67` |

### High (13 issues)

| # | Category | Issue | File |
|---|----------|-------|------|
| 8 | Security | Missing HSTS header | `public/_headers` |
| 9 | Technical | Session 404 sends 302 redirect instead of 404 status | `session/[slug].astro:11,22` |
| 10 | Technical | Article content inside `client:load` React island | `session/[slug].astro:128` |
| 11 | Schema | No Organization schema anywhere | `MainLayout.astro` |
| 12 | Schema | 147 YouTube videos have no VideoObject schema | `sessions.astro` |
| 13 | Schema | SearchAction target may not have working search | `index.astro:24-30` |
| 14 | Content | No author profile pages or credential system | `types.ts:18-19` |
| 15 | Content | No research citations for wellness claims | Site-wide |
| 16 | Content | Contact page missing from main navigation | `Navbar.tsx:42-46` |
| 17 | Content | No category landing pages (Sleep, Anxiety, Focus) | `constants.ts:1` |
| 18 | Content | No visible breadcrumb navigation despite JSON-LD | `session/[slug].astro` |
| 19 | Performance | Navbar `client:load` forces React on critical path | `MainLayout.astro:66` |
| 20 | Performance | AudioManager + PlayerBar `client:load` (render nothing) | `MainLayout.astro:75-76` |
| 21 | Sitemap | 3 noindexed pages included in sitemap | `sitemap.xml.ts:14-16` |

### Medium (14 issues)

| # | Category | Issue | File |
|---|----------|-------|------|
| 22 | Security | Missing Content-Security-Policy | `public/_headers` |
| 23 | Technical | No AI crawler rules in robots.txt | `public/robots.txt` |
| 24 | Content | About page content off-topic for wellness niche | `about.astro:14-28` |
| 25 | Content | Sessions listing page thin content (~35 words) | `sessions.astro:53-61` |
| 26 | Content | Legal pages skip H2 heading level (H1 -> H3) | `privacy.astro:38` |
| 27 | Content | Placeholder social links (`#`) | `about.astro:30-34` |
| 28 | Content | Personal Gmail instead of domain-matched email | `contact.astro:40` |
| 29 | Content | Contact form uses mailto: not server submission | `ContactForm.tsx:13` |
| 30 | Content | Dates not visible in UI on session pages | `DetailInteractive.tsx` |
| 31 | Schema | No AudioObject for meditation audio sessions | `session/[slug].astro` |
| 32 | Schema | Article missing `mainEntityOfPage` | `session/[slug].astro` |
| 33 | Schema | No schema on About page | `about.astro` |
| 34 | Performance | No responsive images (srcset/sizes) anywhere | Site-wide |
| 35 | Performance | No `<link rel="preload">` for hero LCP image | `index.astro:75-83` |

### Low (10 issues)

| # | Category | Issue | File |
|---|----------|-------|------|
| 36 | Technical | No trailing slash normalization | `astro.config.mjs` |
| 37 | Technical | No `theme-color` meta tag | `MainLayout.astro` |
| 38 | Content | Generic author avatar placeholder | `DetailInteractive.tsx:79` |
| 39 | Schema | No ContactPage schema | `contact.astro` |
| 40 | Schema | WebSite schema missing `inLanguage` | `index.astro` |
| 41 | Sitemap | All static lastmod dates identical | `sitemap.xml.ts:10-16` |
| 42 | Sitemap | Inconsistent lastmod format | `sitemap.xml.ts` |
| 43 | Performance | Skeleton height mismatch (192px vs 304px) | `SessionCardSkeleton.tsx:4` |
| 44 | Performance | PlayerBar image missing width/height | `PlayerBar.tsx:29` |
| 45 | Performance | _routes.json should exclude more static files | `public/_routes.json` |
