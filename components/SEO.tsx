
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
}

const SEO: React.FC<SEOProps> = ({
    title = "Daily Meditation Guide",
    description = "Your daily guide to mindfulness and meditation.",
    keywords = "meditation, mindfulness, wellness, mental health, daily guide",
    image = "/og-image.jpg", // Ensure this image exists in public folder or use a remote URL
    url = "https://dailymeditationguide.com",
    type = "website",
    canonical,
}) => {
    const siteTitle = title === "Daily Meditation Guide" ? title : `${title} | Daily Meditation Guide`;
    const canonicalUrl = canonical || url;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

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
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": type === 'article' ? 'Article' : 'WebSite',
                    "name": siteTitle,
                    "description": description,
                    "url": url,
                    "image": image,
                    "publisher": {
                        "@type": "Organization",
                        "name": "Daily Meditation Guide",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://dailymeditationguide.com/logo.png"
                        }
                    }
                })}
            </script>
        </Helmet>
    );
};

export default SEO;
