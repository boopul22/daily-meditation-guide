import type { Session, Infographic, Author } from '../types';

export function rowToSession(row: any): Session {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author_name ?? row.author,
    role: row.author_role ?? row.role,
    authorId: row.author_id ?? null,
    authorPicture: row.author_picture ?? '',
    authorSlug: row.author_slug ?? '',
    duration: row.duration,
    durationSec: row.duration_sec,
    category: row.category,
    color: row.color,
    description: row.description,
    featuredImage: row.featured_image,
    audioUrl: row.audio_url,
    fullContent: row.full_content,
    relatedSessions: row.related_sessions ? JSON.parse(row.related_sessions) : [],
    faqItems: row.faq_items ? JSON.parse(row.faq_items) : [],
    status: row.status || 'published',
    publishedAt: row.published_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version ?? 1,
    lastUpdatedBy: row.last_updated_by || null,
  };
}

export function rowToAuthor(row: any): Author {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role || '',
    picture: row.picture || '',
    bio: row.bio || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Shared SELECT clause that joins the authors table for display fields.
// Any code that reads session rows for display should use this instead of SELECT *.
export const SESSION_SELECT_WITH_AUTHOR = `
  SELECT s.*,
         a.name AS author_name,
         a.role AS author_role,
         a.picture AS author_picture,
         a.slug AS author_slug
  FROM sessions s
  LEFT JOIN authors a ON a.id = s.author_id
`;

export function rowToInfographic(row: any): Infographic {
  let tags: string[] = [];
  try {
    tags = row.tags ? JSON.parse(row.tags) : [];
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    imageUrl: row.image_url || '',
    imageWidth: row.image_width || 0,
    imageHeight: row.image_height || 0,
    altText: row.alt_text || '',
    tags,
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    status: (row.status || 'draft') as 'draft' | 'published',
    publishedAt: row.published_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version ?? 1,
    lastUpdatedBy: row.last_updated_by || null,
  };
}
