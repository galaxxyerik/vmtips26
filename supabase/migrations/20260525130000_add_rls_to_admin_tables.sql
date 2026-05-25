-- Enable RLS on tables that were created without it

-- vmt_drafts: allow users to read/write only their own draft row
alter table vmt_drafts enable row level security;

-- Drafts are read/written through the service role (admin API route) only.
-- No anon/authenticated policies — all draft access goes through /api/draft
-- which uses createServiceClient(), bypassing RLS.

-- vmt_admin_log: only the service role may read or write
alter table vmt_admin_log enable row level security;
-- No policies — only service role (bypasses RLS) can insert/select.

-- vmt_system_config: only the service role may read or write
alter table vmt_system_config enable row level security;
-- No policies — only service role (bypasses RLS) can insert/select/update.
