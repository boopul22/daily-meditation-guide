-- Optional lead capture for free tools (soft freemium)
CREATE TABLE IF NOT EXISTS tool_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  tool_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(email, tool_slug)
);

CREATE INDEX IF NOT EXISTS idx_tool_leads_created ON tool_leads(created_at);
