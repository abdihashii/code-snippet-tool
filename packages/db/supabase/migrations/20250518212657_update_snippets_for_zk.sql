-- Add user_id column to associate snippets with users
ALTER TABLE snippets
ADD COLUMN IF NOT EXISTS user_id UUID NULL;

-- Add columns for premium password protection feature
ALTER TABLE snippets
ADD COLUMN IF NOT EXISTS encrypted_dek BYTEA NULL,
ADD COLUMN IF NOT EXISTS iv_for_dek BYTEA NULL,
ADD COLUMN IF NOT EXISTS auth_tag_for_dek BYTEA NULL,
ADD COLUMN IF NOT EXISTS kdf_salt BYTEA NULL,
ADD COLUMN IF NOT EXISTS kdf_parameters JSONB NULL;

-- Add comments to explain the new columns
COMMENT ON COLUMN snippets.user_id IS 'The ID of the user who created this snippet (NULL for anonymous snippets)';
COMMENT ON COLUMN snippets.encrypted_dek IS 'The encrypted Data Encryption Key (DEK) for password-protected snippets';
COMMENT ON COLUMN snippets.iv_for_dek IS 'The initialization vector used to encrypt the DEK';
COMMENT ON COLUMN snippets.auth_tag_for_dek IS 'The authentication tag for the encrypted DEK';
COMMENT ON COLUMN snippets.kdf_salt IS 'The salt used in the Key Derivation Function (KDF)';
COMMENT ON COLUMN snippets.kdf_parameters IS 'The parameters used in the KDF (iterations, hash function, etc.)';

-- Optional: If you have a 'users' table and want to add a foreign key constraint for user_id
-- ALTER TABLE snippets
-- ADD CONSTRAINT fk_user
-- FOREIGN KEY (user_id) REFERENCES users(id)
-- ON DELETE SET NULL; -- Or ON DELETE CASCADE, depending on desired behavior