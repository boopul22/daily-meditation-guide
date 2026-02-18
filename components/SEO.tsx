
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    canonical?: string;
    noindex?: boolean;
    author?: string;
    publishedAt?: string | null;
    updatedAt?: string | null;
    articleSection?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = "Daily Meditation Guide",
    description = "Your daily guide to mindfulness and meditation.",
    keywords = "meditation, mindfulness, wellness, mental health, daily guide",
    image = "/og-image.jpg",
    url = "https://dailymeditationguide.com",
    type = "website",
    canonical,
    noindex = false,
    author,
    publishedAt,
    updatedAt,
    articleSection,
}) => {
    const siteTitle = title === "Daily Meditation Guide" ? title : `${title} | Daily Meditation Guide`;
    const canonicalUrl = canonical || url;

    const isArticle = type === 'article';

    const jsonLd = isArticle
        ? {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": siteTitle,
            "description": description,
            "url": url,
            "image": image,
            ...(articleSection && { "articleSection": articleSection }),
            ...(author && {
                "author": {
                    "@type": "Person",
                    "name": author
                }
            }),
            ...(publishedAt && { "datePublished": publishedAt }),
            ...(updatedAt && { "dateModified": updatedAt }),
            "publisher": {
                "@type": "Organization",
                "name": "Daily Meditation Guide",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://dailymeditationguide.com/logo.png"
                }
            }
        }
        : {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Daily Meditation Guide",
            "description": description,
            "url": "https://dailymeditationguide.com",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://dailymeditationguide.com/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        };

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph tags */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content={type} />

            {/* Twitter Card tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data (JSON-LD) */}
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>
        </Helmet>
    );
};

export default SEO;
