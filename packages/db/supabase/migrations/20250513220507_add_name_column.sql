-- Add name column to snippets table. It is nullable
alter table snippets
add column name text;
