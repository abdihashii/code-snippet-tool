-- Add password protection fields to snippets table
ALTER TABLE snippets
  ADD COLUMN IF NOT EXISTS encrypted_dek BYTEA,
  ADD COLUMN IF NOT EXISTS iv_for_dek BYTEA,
  ADD COLUMN IF NOT EXISTS auth_tag_for_dek BYTEA,
  ADD COLUMN IF NOT EXISTS kdf_salt BYTEA,
  ADD COLUMN IF NOT EXISTS kdf_parameters JSONB;

-- Add comments to explain the new columns
COMMENT ON COLUMN snippets.encrypted_dek IS 'The encrypted Data Encryption Key (DEK) for password-protected snippets';
COMMENT ON COLUMN snippets.iv_for_dek IS 'The initialization vector used to encrypt the DEK';
COMMENT ON COLUMN snippets.auth_tag_for_dek IS 'The authentication tag for the encrypted DEK';
COMMENT ON COLUMN snippets.kdf_salt IS 'The salt used in the Key Derivation Function (KDF)';
COMMENT ON COLUMN snippets.kdf_parameters IS 'The parameters used in the KDF (iterations, hash function, etc.)'; 