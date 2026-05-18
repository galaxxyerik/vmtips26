-- VM-tips 26: Supabase Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── users ──────────────────────────────────────────────────────────────────
create table public.users (
  id          uuid references auth.users on delete cascade not null primary key,
  email       text not null,
  name        text,
  avatar_url  text,
  is_verified boolean not null default false,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

create policy "Public profiles are viewable"
  on public.users for select
  using (true);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── matches ─────────────────────────────────────────────────────────────────
create table public.matches (
  id                  integer primary key,  -- API-Football match ID
  phase               text not null check (phase in ('group','r32','r16','qf','sf','final')),
  group_label         text check (group_label in ('A','B','C','D','E','F','G','H','I','J','K','L')),
  home_team           text not null,
  away_team           text not null,
  home_score          integer,
  away_score          integer,
  home_goal_scorers   jsonb not null default '[]',
  away_goal_scorers   jsonb not null default '[]',
  kickoff             timestamptz not null,
  api_updated_at      timestamptz
);

alter table public.matches enable row level security;

create policy "Matches are publicly readable"
  on public.matches for select
  using (true);

create policy "Service role can manage matches"
  on public.matches for all
  using (auth.role() = 'service_role');

-- ─── picks ───────────────────────────────────────────────────────────────────
create table public.picks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users on delete cascade not null,
  match_id     integer references public.matches on delete cascade not null,
  pick         text not null check (pick in ('1','X','2')),
  points       integer,
  submitted_at timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.picks enable row level security;

create policy "Users can read own picks"
  on public.picks for select
  using (auth.uid() = user_id);

create policy "Users can insert own picks"
  on public.picks for insert
  with check (auth.uid() = user_id);

create policy "Service role can manage picks"
  on public.picks for all
  using (auth.role() = 'service_role');

create policy "Confirmed picks are publicly readable"
  on public.picks for select
  using (
    exists (
      select 1 from public.submission_status ss
      where ss.user_id = picks.user_id and ss.confirmed = true
    )
  );

-- ─── third_place_picks ───────────────────────────────────────────────────────
create table public.third_place_picks (
  user_id  uuid references public.users on delete cascade not null,
  team     text not null,
  advances boolean not null default false,
  primary key (user_id, team)
);

alter table public.third_place_picks enable row level security;

create policy "Users can read own third place picks"
  on public.third_place_picks for select
  using (auth.uid() = user_id);

create policy "Service role can manage third place picks"
  on public.third_place_picks for all
  using (auth.role() = 'service_role');

-- ─── bracket_picks ───────────────────────────────────────────────────────────
create table public.bracket_picks (
  user_id    uuid references public.users on delete cascade not null,
  match_id   integer not null,
  pick_team  text not null,
  primary key (user_id, match_id)
);

alter table public.bracket_picks enable row level security;

create policy "Users can read own bracket picks"
  on public.bracket_picks for select
  using (auth.uid() = user_id);

create policy "Service role can manage bracket picks"
  on public.bracket_picks for all
  using (auth.role() = 'service_role');

-- ─── top_scorer_picks ────────────────────────────────────────────────────────
create table public.top_scorer_picks (
  user_id     uuid references public.users on delete cascade not null,
  scope       text not null,  -- 'group_A'..'group_L' | 'tournament'
  player_name text not null,
  primary key (user_id, scope)
);

alter table public.top_scorer_picks enable row level security;

create policy "Users can read own top scorer picks"
  on public.top_scorer_picks for select
  using (auth.uid() = user_id);

create policy "Service role can manage top scorer picks"
  on public.top_scorer_picks for all
  using (auth.role() = 'service_role');

-- ─── submission_status ───────────────────────────────────────────────────────
create table public.submission_status (
  user_id      uuid references public.users on delete cascade not null primary key,
  submitted    boolean not null default false,
  confirmed    boolean not null default false,
  confirmed_at timestamptz
);

alter table public.submission_status enable row level security;

create policy "Users can read own submission status"
  on public.submission_status for select
  using (auth.uid() = user_id);

create policy "Service role can manage submission status"
  on public.submission_status for all
  using (auth.role() = 'service_role');

create policy "Admins can read all submission status"
  on public.submission_status for select
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- ─── notifications ───────────────────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references public.users on delete cascade not null,
  type       text not null,
  payload    jsonb not null default '{}',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Service role can manage notifications"
  on public.notifications for all
  using (auth.role() = 'service_role');

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index picks_user_id_idx on public.picks (user_id);
create index picks_match_id_idx on public.picks (match_id);
create index matches_phase_idx on public.matches (phase);
create index matches_group_idx on public.matches (group_label);
create index notifications_user_id_idx on public.notifications (user_id);
