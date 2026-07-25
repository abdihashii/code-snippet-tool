-- Add Row Level Security to the snippets table.
--
-- Background: the snippets table was created without RLS or any grants to the
-- `anon` role, so inserts via the anon/publishable Supabase key failed with
-- "permission denied for table snippets". This mirrors the feedback table's
-- RLS migration (20251231000001_add_rls_to_feedback.sql).
--
-- Zero-knowledge model: the server only stores/retrieves encrypted blobs, so
-- anon (anyone with the snippet id, embedded in the shareable URL) can both
-- create and read a snippet. No update or delete for anon.

-- Grant table-level access to anon/authenticated.
-- RLS policies only gate rows; they do NOT replace the table-level GRANT.
-- Raw migrations don't auto-grant (the Supabase SQL editor does), so this is
-- required for the policies below to take effect.
GRANT SELECT, INSERT ON snippets TO anon, authenticated;

-- Enable Row Level Security (idempotent - safe to run if already enabled)
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Insert: anyone (anon + authenticated) can create a snippet.
DROP POLICY IF EXISTS "Anyone can create snippets" ON snippets;
CREATE POLICY "Anyone can create snippets"
  ON snippets FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Select: anyone (anon + authenticated) can read a snippet by id.
-- The id-by-itself acts as the access token (the DEK lives in the URL fragment,
-- server-side never sees it).
DROP POLICY IF EXISTS "Anyone can read snippets" ON snippets;
CREATE POLICY "Anyone can read snippets"
  ON snippets FOR SELECT
  TO anon, authenticated
  USING (true);
