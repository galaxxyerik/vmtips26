-- Corrective migration for English team names (verified against live data June 9, 2026).
--
-- 1. vmt_matches group G still said "Belgium" (ids 16, 39, 66) — the translate
--    migration 20260519150000 was missing Belgium from its mapping.
-- 2. The translate migration only updated vmt_matches, never the pick tables.
--    Two submissions (made before May 19) have English names in
--    vmt_group_table_picks (64 rows) and vmt_bracket_picks (23 rows), which
--    match no team in vmt_matches and therefore break scoring.
-- 3. 26 rows in vmt_drafts contain "Belgium" in their JSON (picked from the UI,
--    which displays vmt_matches names).
--
-- Backups are created first (CREATE TABLE ... AS SELECT) so this is recoverable.

-- ── Backups ────────────────────────────────────────────────────────────────
create table if not exists public.vmt_matches_backup_20260609 as
  select * from public.vmt_matches;
create table if not exists public.vmt_group_table_picks_backup_20260609 as
  select * from public.vmt_group_table_picks;
create table if not exists public.vmt_bracket_picks_backup_20260609 as
  select * from public.vmt_bracket_picks;
create table if not exists public.vmt_drafts_backup_20260609 as
  select * from public.vmt_drafts;

-- Backups must not be readable via the API
alter table public.vmt_matches_backup_20260609 enable row level security;
alter table public.vmt_group_table_picks_backup_20260609 enable row level security;
alter table public.vmt_bracket_picks_backup_20260609 enable row level security;
alter table public.vmt_drafts_backup_20260609 enable row level security;

-- ── 1. vmt_matches: Belgium → Belgien ──────────────────────────────────────
update public.vmt_matches set home_team = 'Belgien' where home_team = 'Belgium';
update public.vmt_matches set away_team = 'Belgien' where away_team = 'Belgium';

-- ── 2. Pick tables: full English → Swedish mapping ─────────────────────────
-- Same mapping as 20260519150000, plus Belgium. Names identical in both
-- languages (England, Portugal, Qatar, ...) need no row here.
update public.vmt_group_table_picks p
set team = m.sv
from (values
  ('Algeria', 'Algeriet'),
  ('Australia', 'Australien'),
  ('Austria', 'Österrike'),
  ('Belgium', 'Belgien'),
  ('Bosnia & Herzegovina', 'Bosnien-Hercegovina'),
  ('Brazil', 'Brasilien'),
  ('Cabo Verde', 'Kap Verde'),
  ('Canada', 'Kanada'),
  ('Congo DR', 'Kongo-Kinshasa'),
  ('Croatia', 'Kroatien'),
  ('Curacao', 'Curaçao'),
  ('Czechia', 'Tjeckien'),
  ('Côte d''Ivoire', 'Elfenbenskusten'),
  ('Egypt', 'Egypten'),
  ('France', 'Frankrike'),
  ('Germany', 'Tyskland'),
  ('IR Iran', 'Iran'),
  ('Iraq', 'Irak'),
  ('Jordan', 'Jordanien'),
  ('Korea Republic', 'Sydkorea'),
  ('Mexico', 'Mexiko'),
  ('Morocco', 'Marocko'),
  ('Netherlands', 'Nederländerna'),
  ('New Zealand', 'Nya Zeeland'),
  ('Norway', 'Norge'),
  ('Saudi Arabia', 'Saudiarabien'),
  ('Scotland', 'Skottland'),
  ('South Africa', 'Sydafrika'),
  ('Spain', 'Spanien'),
  ('Sweden', 'Sverige'),
  ('Switzerland', 'Schweiz'),
  ('Tunisia', 'Tunisien'),
  ('Turkey', 'Turkiet'),
  ('Türkiye', 'Turkiet'),
  ('United States', 'USA')
) as m(en, sv)
where p.team = m.en;

update public.vmt_bracket_picks p
set pick_team = m.sv
from (values
  ('Algeria', 'Algeriet'),
  ('Australia', 'Australien'),
  ('Austria', 'Österrike'),
  ('Belgium', 'Belgien'),
  ('Bosnia & Herzegovina', 'Bosnien-Hercegovina'),
  ('Brazil', 'Brasilien'),
  ('Cabo Verde', 'Kap Verde'),
  ('Canada', 'Kanada'),
  ('Congo DR', 'Kongo-Kinshasa'),
  ('Croatia', 'Kroatien'),
  ('Curacao', 'Curaçao'),
  ('Czechia', 'Tjeckien'),
  ('Côte d''Ivoire', 'Elfenbenskusten'),
  ('Egypt', 'Egypten'),
  ('France', 'Frankrike'),
  ('Germany', 'Tyskland'),
  ('IR Iran', 'Iran'),
  ('Iraq', 'Irak'),
  ('Jordan', 'Jordanien'),
  ('Korea Republic', 'Sydkorea'),
  ('Mexico', 'Mexiko'),
  ('Morocco', 'Marocko'),
  ('Netherlands', 'Nederländerna'),
  ('New Zealand', 'Nya Zeeland'),
  ('Norway', 'Norge'),
  ('Saudi Arabia', 'Saudiarabien'),
  ('Scotland', 'Skottland'),
  ('South Africa', 'Sydafrika'),
  ('Spain', 'Spanien'),
  ('Sweden', 'Sverige'),
  ('Switzerland', 'Schweiz'),
  ('Tunisia', 'Tunisien'),
  ('Turkey', 'Turkiet'),
  ('Türkiye', 'Turkiet'),
  ('United States', 'USA')
) as m(en, sv)
where p.pick_team = m.en;

-- ── 3. Server drafts: "Belgium" token in draft JSON ────────────────────────
-- Verified June 9: "Belgium" is the only English name present in vmt_drafts.
update public.vmt_drafts
set draft = replace(draft::text, '"Belgium"', '"Belgien"')::jsonb
where draft::text like '%"Belgium"%';
