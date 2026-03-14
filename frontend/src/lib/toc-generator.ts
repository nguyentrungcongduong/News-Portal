/**
 * Generate Table of Contents from HTML content
 * Scans for H2 and H3 headings and creates TOC structure
 */

export interface TOCItem {
    id: string;
    text: string;
    level: 2 | 3;
}

export function generateTOC(html: string): TOCItem[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    const toc: TOCItem[] = [];

    headings.forEach((heading) => {
        const text = heading.textContent?.trim() || '';
        const level = heading.tagName.toLowerCase() === 'h2' ? 2 : 3;
        
        // Generate slug from text
        const id = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim();

        // Add ID to heading if not exists
        if (!heading.id) {
            heading.id = id;
        }

        toc.push({
            id: heading.id || id,
            text,
            level,
        });
    });

    return toc;
}

/**
 * Inject IDs into HTML headings for smooth scroll
 */
export function injectHeadingIDs(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');

    headings.forEach((heading) => {
        if (!heading.id) {
            const text = heading.textContent?.trim() || '';
            const id = text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            
            heading.id = id;
        }
    });

    return doc.body.innerHTML;
}

