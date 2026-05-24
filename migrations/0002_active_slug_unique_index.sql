DROP INDEX IF EXISTS links_slug_unique;
CREATE UNIQUE INDEX IF NOT EXISTS links_active_slug_unique ON links(slug) WHERE status = 'active' AND deleted_at IS NULL;
