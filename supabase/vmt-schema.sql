-- VM-tips 2026 schema

create table if not exists vmt_matches (
  id serial primary key,
  match_number int unique,
  phase text not null check (phase in ('group','r32','r16','qf','sf','bronze','final')),
  group_label text,
  home_team text not null,
  away_team text not null,
  kickoff timestamptz not null,
  venue text,
  home_score int,
  away_score int,
  result text check (result in ('1','X','2')),
  status text default 'scheduled' check (status in ('scheduled','live','finished'))
);

create table if not exists vmt_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  submitted_at timestamptz default now(),
  confirmed bool default false,
  total_points numeric default 0
);

create table if not exists vmt_group_picks (
  id serial primary key,
  submission_id uuid references vmt_submissions(id) on delete cascade not null,
  match_id int references vmt_matches(id) not null,
  pick text not null check (pick in ('1','X','2')),
  unique (submission_id, match_id)
);

create table if not exists vmt_group_table_picks (
  id serial primary key,
  submission_id uuid references vmt_submissions(id) on delete cascade not null,
  group_label text not null,
  position int not null check (position between 1 and 4),
  team text not null,
  unique (submission_id, group_label, position)
);

create table if not exists vmt_third_place_picks (
  id serial primary key,
  submission_id uuid references vmt_submissions(id) on delete cascade not null,
  group_label text not null,
  selected bool not null default false,
  unique (submission_id, group_label)
);

create table if not exists vmt_group_scorer_picks (
  id serial primary key,
  submission_id uuid references vmt_submissions(id) on delete cascade not null,
  group_label text not null,
  player_name text not null,
  unique (submission_id, group_label)
);

create table if not exists vmt_tournament_scorer_pick (
  id serial primary key,
  submission_id uuid references vmt_submissions(id) on delete cascade not null unique,
  player_name text not null
);

create table if not exists vmt_bracket_picks (
  id serial primary key,
  submission_id uuid references vmt_submissions(id) on delete cascade not null,
  match_number int not null,
  pick_team text not null,
  round text not null check (round in ('r32','r16','qf','sf','bronze','final')),
  unique (submission_id, match_number)
);

create table if not exists vmt_notifications (
  id serial primary key,
  type text not null,
  payload jsonb,
  created_at timestamptz default now(),
  sent bool default false
);

-- Enable RLS
alter table vmt_matches enable row level security;
alter table vmt_submissions enable row level security;
alter table vmt_group_picks enable row level security;
alter table vmt_group_table_picks enable row level security;
alter table vmt_third_place_picks enable row level security;
alter table vmt_group_scorer_picks enable row level security;
alter table vmt_tournament_scorer_pick enable row level security;
alter table vmt_bracket_picks enable row level security;
alter table vmt_notifications enable row level security;

-- Matches: public read
create policy "public read matches" on vmt_matches for select using (true);

-- Submissions: confirmed ones public, own always
create policy "public read confirmed submissions" on vmt_submissions
  for select using (confirmed = true);
create policy "own submission readable" on vmt_submissions
  for select using (auth.uid() = user_id);

-- Picks: own readable by owner
create policy "own group picks" on vmt_group_picks
  for select using (
    submission_id in (select id from vmt_submissions where user_id = auth.uid())
  );
create policy "own table picks" on vmt_group_table_picks
  for select using (
    submission_id in (select id from vmt_submissions where user_id = auth.uid())
  );
create policy "own third place picks" on vmt_third_place_picks
  for select using (
    submission_id in (select id from vmt_submissions where user_id = auth.uid())
  );
create policy "own group scorer picks" on vmt_group_scorer_picks
  for select using (
    submission_id in (select id from vmt_submissions where user_id = auth.uid())
  );
create policy "own tournament scorer" on vmt_tournament_scorer_pick
  for select using (
    submission_id in (select id from vmt_submissions where user_id = auth.uid())
  );
create policy "own bracket picks" on vmt_bracket_picks
  for select using (
    submission_id in (select id from vmt_submissions where user_id = auth.uid())
  );
-- Confirmed submissions: their picks are public
create policy "public read confirmed group picks" on vmt_group_picks
  for select using (
    submission_id in (select id from vmt_submissions where confirmed = true)
  );
create policy "public read confirmed bracket picks" on vmt_bracket_picks
  for select using (
    submission_id in (select id from vmt_submissions where confirmed = true)
  );
