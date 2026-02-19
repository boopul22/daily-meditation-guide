import { SessionRow } from '../types';

export function rowToAPI(row: SessionRow) {
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
