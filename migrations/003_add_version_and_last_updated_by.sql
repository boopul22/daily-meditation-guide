-- Add optimistic locking version and audit trail for multi-admin collaboration
ALTER TABLE sessions ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE sessions ADD COLUMN last_updated_by TEXT DEFAULT NULL;
