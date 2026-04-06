
export interface TOCItem {
    id: string;
    text: string;
    level: number;
}

/**
 * Parses HTML string, injects IDs into h2/h3 tags, and returns the modified HTML and extracted headings.
 * Works both server-side (regex-based) and client-side (DOMParser).
 */
export const processContentForTOC = (htmlContent: string): { processedContent: string; headings: TOCItem[] } => {
    const headings: TOCItem[] = [];

    // Use regex-based approach that works both server-side and client-side
    const headingRegex = /<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi;

    const processedContent = htmlContent.replace(headingRegex, (match, tag, attrs, innerHtml) => {
        const text = innerHtml.replace(/<[^>]*>/g, '').trim();
        const level = parseInt(tag.substring(1), 10);

        const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `heading-${headings.length}`;

        // Ensure uniqueness
        let uniqueSlug = slug;
        let counter = 1;
        while (headings.some(h => h.id === uniqueSlug)) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        headings.push({ id: uniqueSlug, text, level });

        return `<${tag}${attrs} id="${uniqueSlug}">${innerHtml}</${tag}>`;
    });

    return { processedContent, headings };
};
