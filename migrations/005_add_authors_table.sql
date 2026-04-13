-- Add normalized authors table with profile pictures
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- Add author_id FK on sessions (legacy author/role columns remain as fallback)
ALTER TABLE sessions ADD COLUMN author_id TEXT REFERENCES authors(id);
CREATE INDEX IF NOT EXISTS idx_sessions_author_id ON sessions(author_id);

-- Seed the default author: all existing posts are by Sheenam Midha, Researcher
INSERT INTO authors (id, slug, name, role, picture, bio)
VALUES ('auth_sheenam_midha', 'sheenam-midha', 'Sheenam Midha', 'Researcher', '', '');

-- Link all existing sessions to the seeded author
UPDATE sessions SET author_id = 'auth_sheenam_midha' WHERE author_id IS NULL;
