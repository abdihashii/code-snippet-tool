-- Update the encrypted_content column to be BYTEA type
alter table snippets
alter column encrypted_content type bytea using encrypted_content::bytea;