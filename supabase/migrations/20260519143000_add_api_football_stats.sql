-- API-Football data used by VM-tipset.
-- Safe to run more than once.

alter table public.vmt_matches
  add column if not exists home_goal_scorers jsonb default '[]'::jsonb,
  add column if not exists away_goal_scorers jsonb default '[]'::jsonb;

create table if not exists public.player_stats (
  player_id int not null,
  player_name text not null,
  nationality text,
  club text,
  league text,
  season int not null,
  goals_club int,
  assists_club int,
  minutes_club int,
  clean_sheets int,
  goals_national int,
  caps_national int,
  updated_at timestamptz default now(),
  primary key (player_id, season)
);

create table if not exists public.vmt_sync_log (
  sync_key text primary key,
  synced_at timestamptz default now(),
  status text,
  message text
);

alter table public.player_stats enable row level security;
alter table public.vmt_sync_log enable row level security;

drop policy if exists "public read player stats" on public.player_stats;
create policy "public read player stats"
  on public.player_stats for select
  using (true);

drop policy if exists "public read sync log" on public.vmt_sync_log;
create policy "public read sync log"
  on public.vmt_sync_log for select
  using (true);
