-- Atomic replace of all picks for a submission.
-- Background: the previous update path in app/api/submit-picks/route.ts deleted all
-- old picks and then ran unchecked inserts without a transaction — a partial failure
-- meant permanent data loss. This RPC does delete+insert in ONE transaction; any
-- error rolls the whole thing back and the old picks survive.
--
-- Only the service role may execute it.

create or replace function public.vmt_replace_picks(
  p_submission_id uuid,
  p_group_picks jsonb,        -- [{ "match_id": 1, "pick": "1" }, ...]
  p_table_picks jsonb,        -- [{ "group_label": "A", "position": 1, "team": "Mexiko" }, ...]
  p_third_place_picks jsonb,  -- [{ "group_label": "A", "selected": true }, ...]
  p_group_scorer_picks jsonb, -- [{ "group_label": "A", "player_name": "..." }, ...]
  p_tournament_scorer text,
  p_bracket_picks jsonb       -- [{ "match_number": 73, "pick_team": "Spanien", "round": "r32" }, ...]
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from vmt_submissions where id = p_submission_id) then
    raise exception 'submission % not found', p_submission_id;
  end if;

  -- Validate 1/X/2 picks
  if exists (
    select 1 from jsonb_array_elements(coalesce(p_group_picks, '[]'::jsonb)) e
    where e->>'pick' not in ('1', 'X', '2')
  ) then
    raise exception 'invalid group pick value';
  end if;

  -- Validate that every picked team actually exists in vmt_matches
  -- (would have caught the English-team-name bug)
  if exists (
    select 1
    from (
      select e->>'team' as team from jsonb_array_elements(coalesce(p_table_picks, '[]'::jsonb)) e
      union all
      select e->>'pick_team' from jsonb_array_elements(coalesce(p_bracket_picks, '[]'::jsonb)) e
    ) picked
    where not exists (
      select 1 from vmt_matches m
      where m.home_team = picked.team or m.away_team = picked.team
    )
  ) then
    raise exception 'unknown team name in picks';
  end if;

  delete from vmt_group_picks where submission_id = p_submission_id;
  delete from vmt_group_table_picks where submission_id = p_submission_id;
  delete from vmt_third_place_picks where submission_id = p_submission_id;
  delete from vmt_group_scorer_picks where submission_id = p_submission_id;
  delete from vmt_tournament_scorer_pick where submission_id = p_submission_id;
  delete from vmt_bracket_picks where submission_id = p_submission_id;

  insert into vmt_group_picks (submission_id, match_id, pick)
  select p_submission_id, (e->>'match_id')::int, e->>'pick'
  from jsonb_array_elements(coalesce(p_group_picks, '[]'::jsonb)) e;

  insert into vmt_group_table_picks (submission_id, group_label, position, team)
  select p_submission_id, e->>'group_label', (e->>'position')::int, e->>'team'
  from jsonb_array_elements(coalesce(p_table_picks, '[]'::jsonb)) e;

  insert into vmt_third_place_picks (submission_id, group_label, selected)
  select p_submission_id, e->>'group_label', (e->>'selected')::boolean
  from jsonb_array_elements(coalesce(p_third_place_picks, '[]'::jsonb)) e;

  insert into vmt_group_scorer_picks (submission_id, group_label, player_name)
  select p_submission_id, e->>'group_label', e->>'player_name'
  from jsonb_array_elements(coalesce(p_group_scorer_picks, '[]'::jsonb)) e;

  if p_tournament_scorer is not null and length(trim(p_tournament_scorer)) > 0 then
    insert into vmt_tournament_scorer_pick (submission_id, player_name)
    values (p_submission_id, trim(p_tournament_scorer));
  end if;

  insert into vmt_bracket_picks (submission_id, match_number, pick_team, round)
  select p_submission_id, (e->>'match_number')::int, e->>'pick_team', e->>'round'
  from jsonb_array_elements(coalesce(p_bracket_picks, '[]'::jsonb)) e;
end;
$$;

revoke all on function public.vmt_replace_picks(uuid, jsonb, jsonb, jsonb, jsonb, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.vmt_replace_picks(uuid, jsonb, jsonb, jsonb, jsonb, text, jsonb)
  to service_role;
