-- Performance indexes for frequently-queried columns

-- Leaderboard + submission lookup by email (used on every submit and login)
create index if not exists idx_vmt_submissions_email on vmt_submissions(lower(email));

-- Submission lookup by authenticated user (dashboard, FloatingReturnToTips)
create index if not exists idx_vmt_submissions_user_id on vmt_submissions(user_id);

-- Leaderboard filter: confirmed submissions only
create index if not exists idx_vmt_submissions_confirmed on vmt_submissions(confirmed);

-- Picks lookup by submission (used on score recalculation and submission detail page)
create index if not exists idx_vmt_group_picks_submission on vmt_group_picks(submission_id);
create index if not exists idx_vmt_bracket_picks_submission on vmt_bracket_picks(submission_id);
create index if not exists idx_vmt_group_scorer_picks_submission on vmt_group_scorer_picks(submission_id);
create index if not exists idx_vmt_tournament_scorer_submission on vmt_tournament_scorer_pick(submission_id);

-- Admin log lookup by admin (audit trail queries)
create index if not exists idx_vmt_admin_log_admin_email on vmt_admin_log(admin_email);
create index if not exists idx_vmt_admin_log_created_at on vmt_admin_log(created_at desc);

-- Matches: frequently filtered by phase and group
create index if not exists idx_vmt_matches_phase on vmt_matches(phase);
create index if not exists idx_vmt_matches_status on vmt_matches(status);
