CREATE TABLE users (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  comment TEXT,
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
  geo_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX links_active_slug_unique ON links(slug) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX links_owner_status_updated_at_idx ON links(owner_id, status, updated_at DESC);
CREATE INDEX links_status_slug_idx ON links(status, slug);
