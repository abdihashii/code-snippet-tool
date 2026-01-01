-- Create feedback table for collecting user feedback
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(10) NOT NULL CHECK (type IN ('quick', 'detailed')),
  rating INTEGER NOT NULL,
  comment TEXT,
  email VARCHAR(255),
  page VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for sorting feedback by time
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- Create index on type for filtering by feedback type
CREATE INDEX idx_feedback_type ON feedback(type);
