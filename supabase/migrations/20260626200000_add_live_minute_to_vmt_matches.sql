-- Running match clock (e.g. "67'", "HT") for in-play matches, shown in the
-- dashboard "Live just nu" panel. Written by updateLiveScores() from ESPN's
-- scoreboard; nullable and ignored once a match is finished. Applied to the
-- live database via the Supabase MCP on 2026-06-26.
alter table vmt_matches add column if not exists live_minute text;
