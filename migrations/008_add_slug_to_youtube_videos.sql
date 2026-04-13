ALTER TABLE youtube_videos ADD COLUMN slug TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_youtube_videos_slug ON youtube_videos(slug) WHERE slug != '';
