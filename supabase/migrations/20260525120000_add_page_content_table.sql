-- Page content table for admin-editable UI copy
create table if not exists vmt_page_content (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz default now()
);

alter table vmt_page_content enable row level security;

-- Anyone can read page content (it's public UI copy)
create policy "Public read vmt_page_content"
  on vmt_page_content for select
  using (true);

-- Only service role (admin API) can insert/update/delete
-- No anon/authenticated insert policy — writes go through the admin API route
-- which uses the service client, bypassing RLS.
