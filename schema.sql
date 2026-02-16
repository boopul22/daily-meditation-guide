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
  full_content TEXT NOT NULL DEFAULT '',
  related_sessions TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
