-- Expires at and max views are now nullable
alter table snippets
alter column max_views drop not null,
alter column expires_at drop not null;