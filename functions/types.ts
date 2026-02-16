export interface Env {
  DB: D1Database;
  ADMIN_PASSWORD: string;
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
  full_content: string;
  related_sessions: string;
  created_at: string;
  updated_at: string;
}
