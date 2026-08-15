-- One-time reconciliation for installations that already ran the former
-- internal schema upgrade and still use the legacy counter primary key.
-- Back up the remote D1 database before executing this file.

CREATE TABLE link_create_counters_next (
  owner_id TEXT NOT NULL,
  counter_type TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  count INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (owner_id, counter_type)
);

INSERT INTO link_create_counters_next (
  owner_id,
  counter_type,
  window_start,
  window_seconds,
  count,
  updated_at
)
SELECT
  counters.owner_id,
  counters.counter_type,
  counters.window_start,
  counters.window_seconds,
  counters.count,
  counters.updated_at
FROM link_create_counters AS counters
INNER JOIN (
  SELECT owner_id, counter_type, max(window_start) AS window_start
  FROM link_create_counters
  GROUP BY owner_id, counter_type
) AS latest
  ON latest.owner_id = counters.owner_id
  AND latest.counter_type = counters.counter_type
  AND latest.window_start = counters.window_start;

DROP TABLE link_create_counters;
ALTER TABLE link_create_counters_next RENAME TO link_create_counters;

CREATE INDEX link_create_counters_updated_at_idx
  ON link_create_counters (updated_at);

INSERT OR IGNORE INTO d1_migrations (name) VALUES
  ('0005_cheerful_slipstream.sql'),
  ('0006_productive_siren.sql');
