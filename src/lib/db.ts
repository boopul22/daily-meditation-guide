import type { Session, Infographic } from '../types';

export function rowToSession(row: any): Session {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    role: row.role,
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
