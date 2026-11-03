-- Short links created from the share dialog.
--
-- The app creates this table automatically on the first request, so running
-- this file yourself is optional. It is useful when provisioning a database
-- ahead of time or when applying the schema with `turso db shell`.

CREATE TABLE IF NOT EXISTS short_links (
  id         TEXT PRIMARY KEY,
  payload    TEXT NOT NULL,
  name       TEXT NOT NULL,
  size       INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS short_links_created_at
  ON short_links (created_at DESC);
