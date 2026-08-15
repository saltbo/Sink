-- One-time upgrade for installations created by the legacy owned-link schema.
-- Back up the remote D1 database before executing this file.

PRAGMA foreign_keys = OFF;

ALTER TABLE links RENAME TO links_legacy;

CREATE TABLE links (
  slug TEXT PRIMARY KEY NOT NULL,
  id TEXT NOT NULL,
  owner_id TEXT DEFAULT 'root' NOT NULL,
  url TEXT NOT NULL,
  comment TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expiration INTEGER,
  title TEXT,
  description TEXT,
  image TEXT,
  apple TEXT,
  google TEXT,
  cloaking INTEGER,
  redirect_with_query INTEGER,
  password TEXT,
  unsafe INTEGER,
  geo TEXT,
  normalized_url TEXT NOT NULL,
  effective_expires_at INTEGER
);

INSERT INTO links (
  slug,
  id,
  owner_id,
  url,
  comment,
  created_at,
  updated_at,
  expiration,
  title,
  description,
  image,
  apple,
  google,
  cloaking,
  redirect_with_query,
  password,
  unsafe,
  geo,
  normalized_url,
  effective_expires_at
)
SELECT
  slug,
  id,
  owner_id,
  url,
  comment,
  created_at,
  updated_at,
  expiration,
  title,
  description,
  image,
  apple,
  google,
  cloaking,
  redirect_with_query,
  password,
  unsafe,
  geo_json,
  CASE
    WHEN instr(url, '?') > 0 THEN substr(url, 1, instr(url, '?') - 1)
    ELSE url
  END,
  expiration
FROM links_legacy
WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX links_created_at_slug_idx ON links (created_at, slug);
CREATE INDEX links_created_at_desc_slug_idx ON links (created_at DESC, slug);
CREATE INDEX links_normalized_url_idx ON links (normalized_url);
CREATE INDEX links_id_idx ON links (id);
CREATE INDEX links_owner_id_created_at_slug_idx ON links (owner_id, created_at, slug);

CREATE TABLE tags (
  name TEXT PRIMARY KEY NOT NULL
);

CREATE TABLE link_tags (
  link_slug TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  PRIMARY KEY (link_slug, tag_name),
  FOREIGN KEY (link_slug) REFERENCES links(slug) ON DELETE CASCADE,
  FOREIGN KEY (tag_name) REFERENCES tags(name) ON DELETE CASCADE
);

CREATE INDEX link_tags_tag_name_link_slug_idx ON link_tags (tag_name, link_slug);

CREATE TABLE link_tombstones (
  slug TEXT PRIMARY KEY NOT NULL,
  deleted_at INTEGER NOT NULL
);

INSERT INTO link_tombstones (slug, deleted_at)
SELECT slug, coalesce(deleted_at, updated_at)
FROM links_legacy
WHERE status = 'deleted' OR deleted_at IS NOT NULL;

CREATE TABLE link_migration_runs (
  id TEXT PRIMARY KEY NOT NULL,
  expected_cursor TEXT,
  scanned INTEGER DEFAULT 0 NOT NULL,
  inserted INTEGER DEFAULT 0 NOT NULL,
  skipped INTEGER DEFAULT 0 NOT NULL,
  expired INTEGER DEFAULT 0 NOT NULL,
  force INTEGER NOT NULL,
  status TEXT DEFAULT 'running' NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX link_migration_runs_status_updated_at_desc_created_at_desc_id_desc_idx
  ON link_migration_runs (status, updated_at DESC, created_at DESC, id DESC);

CREATE TABLE link_create_counters (
  owner_id TEXT NOT NULL,
  counter_type TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  count INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner_id, counter_type)
);

CREATE INDEX link_create_counters_updated_at_idx
  ON link_create_counters (updated_at);

CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT OR IGNORE INTO d1_migrations (name) VALUES
  ('0000_workable_killraven.sql'),
  ('0001_parched_strong_guy.sql'),
  ('0002_chilly_aaron_stack.sql'),
  ('0003_hesitant_namora.sql'),
  ('0004_quiet_lionheart.sql'),
  ('0005_cheerful_slipstream.sql'),
  ('0006_productive_siren.sql');

DROP TABLE links_legacy;

PRAGMA foreign_keys = ON;
