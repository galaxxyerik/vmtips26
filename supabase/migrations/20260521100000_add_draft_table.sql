-- Server-side draft persistence so users can resume on a different device
create table if not exists vmt_drafts (
  email text primary key,
  draft jsonb not null,
  updated_at timestamptz default now()
);
