-- Add auth_tag column to snippets table
ALTER TABLE snippets 
ADD COLUMN auth_tag BYTEA;
