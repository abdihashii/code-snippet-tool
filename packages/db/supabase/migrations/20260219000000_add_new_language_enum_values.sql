-- Add previously missing language enum values (added to TypeScript but not migrated)
ALTER TYPE language ADD VALUE IF NOT EXISTS 'SQL';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'RUST';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'PHP';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'RUBY';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'GO';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'C';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'CPP';

-- Add new config file format language enum values
ALTER TYPE language ADD VALUE IF NOT EXISTS 'DOTENV';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'YAML';
ALTER TYPE language ADD VALUE IF NOT EXISTS 'TOML';
