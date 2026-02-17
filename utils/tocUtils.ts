
export interface TOCItem {
    id: string;
    text: string;
    level: number;
}

/**
 * Parses HTML string, injects IDs into h2/h3 tags, and returns the modified HTML and extracted headings.
 * This is a client-side implementation using DOMParser.
 */
export const processContentForTOC = (htmlContent: string): { processedContent: string; headings: TOCItem[] } => {
    if (typeof window === 'undefined') {
        // SSR safe-ish fallback, though this app is CSR
        return { processedContent: htmlContent, headings: [] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headings: TOCItem[] = [];

    const headers = doc.querySelectorAll('h2, h3');

    headers.forEach((header, index) => {
        const text = header.textContent || '';
        // Create a slug from text or fallback to index
        const slug = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `heading-${index}`;

        // Ensure uniqueness
        let uniqueSlug = slug;
        let counter = 1;
        while (headings.some(h => h.id === uniqueSlug)) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        header.id = uniqueSlug;
        headings.push({
            id: uniqueSlug,
            text: text,
            level: parseInt(header.tagName.substring(1), 10)
        });
    });

    return {
        processedContent: doc.body.innerHTML,
        headings
    };
};
