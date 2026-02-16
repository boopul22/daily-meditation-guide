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
    relatedSessions: JSON.parse(row.related_sessions),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
