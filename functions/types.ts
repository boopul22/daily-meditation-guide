export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  ADMIN_PASSWORD: string;
  CF_ACCESS_TEAM_NAME: string;
  CF_ACCESS_AUD: string;
  R2_PUBLIC_URL: string;
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
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  picture: string;
  created_at: string;
  last_login: string;
}
