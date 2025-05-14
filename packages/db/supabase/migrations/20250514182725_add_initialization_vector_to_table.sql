-- Add initialization vector to the table
alter table snippets
add column initialization_vector bytea;
