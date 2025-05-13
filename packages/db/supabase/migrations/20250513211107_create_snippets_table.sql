CREATE TYPE language AS ENUM (
  'PLAINTEXT',
  'JSON',
  'JAVASCRIPT',
  'PYTHON',
  'HTML',
  'CSS',
  'TYPESCRIPT',
  'JAVA',
  'BASH',
  'MARKDOWN',
  'CSHARP'
);

create table snippets (
  id uuid primary key default uuid_generate_v4(),
  encrypted_content text not null,
  title VARCHAR(255),
  language language not null default 'PLAINTEXT',
  max_views int not null default 1,
  current_views int not null default 0,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
