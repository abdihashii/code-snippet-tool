-- Add Row Level Security to existing feedback table
-- This migration handles both fresh installs (where RLS may already be enabled)
-- and existing installations (where the table exists without RLS)

-- Enable Row Level Security (idempotent - safe to run if already enabled)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists (from fresh install via previous migration)
DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;

-- Create policy allowing anyone to submit feedback
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
