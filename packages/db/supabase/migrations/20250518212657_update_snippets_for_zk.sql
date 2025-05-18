-- Add user_id column to associate snippets with users
ALTER TABLE snippets
ADD COLUMN user_id UUID NULL;

-- Add columns for premium password protection feature
ALTER TABLE snippets
ADD COLUMN encrypted_dek BYTEA NULL,
ADD COLUMN iv_for_dek BYTEA NULL,
ADD COLUMN auth_tag_for_dek BYTEA NULL,
ADD COLUMN kdf_salt BYTEA NULL,
ADD COLUMN kdf_parameters JSONB NULL;

-- Optional: If you have a 'users' table and want to add a foreign key constraint for user_id
-- ALTER TABLE snippets
-- ADD CONSTRAINT fk_user
-- FOREIGN KEY (user_id) REFERENCES users(id)
-- ON DELETE SET NULL; -- Or ON DELETE CASCADE, depending on desired behavior