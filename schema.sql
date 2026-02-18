DROP TABLE IF EXISTS sessions;

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT NOT NULL,
  duration TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  featured_image TEXT NOT NULL DEFAULT '',
  audio_url TEXT NOT NULL DEFAULT '',
  full_content TEXT NOT NULL DEFAULT '',
  related_sessions TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login TEXT NOT NULL DEFAULT (datetime('now'))
);
