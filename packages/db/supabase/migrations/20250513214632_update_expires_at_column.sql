alter table snippets
alter column expires_at SET NOT NULL,
alter column expires_at SET DEFAULT (now() + interval '24 hours');