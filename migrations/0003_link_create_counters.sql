CREATE TABLE IF NOT EXISTS link_create_counters (
  owner_id TEXT NOT NULL,
  counter_type TEXT NOT NULL CHECK (counter_type IN ('quota', 'rate')),
  window_start INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  count INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner_id, counter_type, window_start)
);

CREATE INDEX IF NOT EXISTS link_create_counters_updated_at_idx ON link_create_counters(updated_at);
