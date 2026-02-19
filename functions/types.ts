export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  CF_ACCESS_TEAM_NAME: string;
  CF_ACCESS_AUD: string;
  R2_PUBLIC_URL: string;
  SESSION_ROOMS: DurableObjectNamespace;
}

export interface SessionRow {
  id: string;
  slug: string;
  title: string;
  author: string;
  role: string;
  duration: string;
  duration_sec: number;
  category: string;
  color: string;
  description: string;
  featured_image: string;
  audio_url: string;
  full_content: string;
  related_sessions: string;
  faq_items: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
  last_updated_by: string | null;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  picture: string;
  is_admin: number;
  created_at: string;
  last_login: string;
}
