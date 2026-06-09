# CLAUDE.md — VM-tips 26

Next.js 15 (App Router) FIFA World Cup 2026 tipping app. Users tip all 48 group matches, a full knockout bracket, and top scorers. Deployed on Vercel, database on Supabase.

## Stack

- **Next.js 15** App Router, TypeScript, Tailwind CSS
- **Supabase** (Postgres + Auth) via `@supabase/ssr`
- **Vercel** — auto-deploys from `master`
- Swedish UI throughout; Swedish team names in DB (e.g. `Spanien`, `Brasilien`)

## Key files

| Path | Purpose |
|------|---------|
| `lib/types.ts` | Core types: `VmtMatch`, `OnboardingDraft`, `Pick`, `GroupLabel` |
| `lib/onboarding-storage.ts` | localStorage draft persistence + server sync to `vmt_drafts` |
| `lib/bracket-logic.ts` | Builds R32 bracket from group results (FIFA Annex C seeding) |
| `lib/group-randomize.ts` | Weighted match randomizer + `TEAM_SCORERS` (2–3 scorers/team) |
| `components/LandingPage.tsx` | Entry form; fetches server draft on load for cross-device resume |
| `app/onboarding/group-stage/page.tsx` | Step 1: pick 1/X/2, group tables, third-place, group scorers |
| `app/onboarding/bracket/page.tsx` | Step 2: knockout bracket picks |
| `app/onboarding/final-details/page.tsx` | Step 3: tournament scorer, password, Swish confirmation |
| `app/api/submit-picks/route.ts` | Final submission — writes all picks to Supabase |
| `app/api/draft/route.ts` | GET/POST/DELETE draft by email (cross-device sync) |
| `supabase/vmt-schema.sql` | Full DB schema reference |
| `supabase/migrations/` | Applied migrations (newest: `20260521100000_add_draft_table.sql`) |

## Database tables

`vmt_matches`, `vmt_submissions`, `vmt_group_picks`, `vmt_group_table_picks`,
`vmt_third_place_picks`, `vmt_group_scorer_picks`, `vmt_tournament_scorer_pick`,
`vmt_bracket_picks`, `vmt_notifications`, `vmt_drafts`

## Onboarding flow

1. **Landing page** — name + email → checks `vmt_drafts` on server for cross-device resume
2. **Group stage** — 72 group matches (1/X/2), group table order, 8 third-place selections, group scorers
3. **Bracket** — 32 knockout matches (R32→R16→QF→SF→Bronze→Final), cascade on pick change
4. **Final details** — tournament scorer, optional password, Swish payment confirmation
5. **Submit** → clears draft from localStorage + server

## Draft persistence

`saveDraft()` writes to localStorage AND fire-and-forgets `POST /api/draft`.
`clearDraft()` removes from localStorage AND sends `DELETE /api/draft`.
`restoreDraft()` writes localStorage only (no server push — used when restoring from server).

## Tailwind conventions

Custom colors: `navy-950/900/800`, `swe-yellow`, `swe-blue`, `pitch-400/500/900`, `loss-500/900`.
Zero border-radius everywhere. No emojis in UI. Swedish copy throughout.

## Git workflow

- Current working pattern in this repo: commit directly to `master` and push to `origin/master` after each completed change unless Erik says otherwise.
- Vercel deploys automatically from `master`.
- Be careful with dirty worktree state: there are unrelated local player-stats/API files that should not be reverted or committed unless explicitly requested.

## Recent work (May 2026)

- Fixed JSX build error and stale bracket picks bug
- Rewrote bracket page: save flash, reset button, progress bar fix, safe area, orientation hint, touch targets
- Added **"↺ Slumpa grupp"** per group (weighted randomizer based on team strength)
- Added **"↺"** scorer randomizer (curated 2–3 candidates per team in `lib/group-randomize.ts`)
- Added **cross-device draft sync** via `vmt_drafts` Supabase table
- Added **1/X/2 deselect** in group stage (tap active button again to clear)
- Added **1 = hemmaseger · X = oavgjort · 2 = bortaseger** hint above match rows
- Added **"Turneringsformat"** section on rules page for football beginners

## Latest status — Bug audit + KO picks incident (June 9, 2026)

A full bug audit was performed June 9 (code + live Supabase data via MCP). Findings below are verified against the live DB. Tournament starts June 11 — time-critical.

### Incident: deleted knockout picks (root cause confirmed)

`supabase/migrations/20260528120000_fix_bracket_and_add_ko_matches.sql` line 62
(`DELETE FROM vmt_bracket_picks WHERE match_number >= 89;`), run manually in SQL Editor
~May 28, hard-deleted all R16/QF/SF/bronze/final picks for the 11 submissions that existed then.
Commit `ba7b3e4e` only fixed the localStorage equivalent.

- 2 of 11 have re-submitted: Johan Engstrand, Kalle Engstrand.
- **9 still missing 16 KO picks each**: Tobias Söderman, Sven Rungner, Ludvig Aslaksen,
  Erik Engstrand, Oscar Alex, Oliver Alex, Anton Söderman, Max Rundström, Elias Aslaksen.
- No soft deletes, archive tables, or audit rows exist (`vmt_admin_log` is empty).
- Elias has a server draft in `vmt_drafts` with full KO picks, but its R32 picks differ from his
  submission on 6 of 16 slots and it was touched June 9 — uncertain provenance, confirm with him.
- Only real recovery: **Supabase PITR/backup** (Dashboard → Database → Backups). Deletion was
  ~May 28; daily 7-day backups won't reach, PITR with ≥14-day retention would. Check ASAP.
- Plan B: ask the 9 users to redo KO picks before deadline.

### Bug status (June 9 evening: critical + high fixed/accepted, applied to live DB)

**Critical — FIXED June 9**
1. ~~Non-atomic delete+insert in submit-picks~~ — fixed via `vmt_replace_picks` Postgres RPC
   (migration `20260609120000`, applied): delete+insert for all six pick tables in ONE
   transaction, validates team names against `vmt_matches` and 1/X/2 values; execute granted
   only to service_role. Route checks the RPC error and deletes a freshly created submission
   row on failure so retries aren't blocked by the duplicate-email 409.
2. ~~English team names~~ — fixed via migration `20260609123000` (applied + verified):
   `vmt_matches` Belgium→Belgien, full EN→SV translation of `vmt_group_table_picks` +
   `vmt_bracket_picks` (Tobias/Sven), `"Belgium"` token replaced in `vmt_drafts` JSON.
   Backup tables `vmt_*_backup_20260609` created first (RLS enabled = hidden from API).
   `loadDraft()` also normalizes `"Belgium"` in localStorage drafts client-side.
   Verified post-migration: 0 unmatched team names in pick tables, 0 "Belgium" anywhere.

**High — fixed or accepted June 9**
3. ~~Draft clobber~~ — fixed: LandingPage no longer server-syncs pick-less drafts (localStorage
   only), and `POST /api/draft` refuses to overwrite a draft that has picks with one that has
   none (silent no-op — callers are fire-and-forget). Deliberate overwrite with a full draft
   is still possible; accepted (email-only identity, Erik chose simplicity over magic links).
4. `GET /api/draft` still leaks name + picks to anyone knowing an email — ACCEPTED by Erik
   (friends pool, drafts irrelevant after the June 11 deadline). Real fix would be emailed
   magic-link resume; revisit if the app outlives the tournament.
5. ~~Stale server drafts~~ — fixed: submit-picks deletes the `vmt_drafts` row via service role
   after a successful submission. Existing stale/test rows deliberately left in place —
   Elias's draft is potential KO-pick recovery evidence, do NOT bulk-delete drafts.
6. ~~Email exposed via RLS~~ — fixed via migration `20260609124500` (applied + verified):
   column-level grants on `vmt_submissions`; anon/authenticated can only SELECT id, user_id,
   name, submitted_at, confirmed, total_points. WARNING: any future client-side `select('*')`
   or email/admin_* column reference on `vmt_submissions` will fail with
   insufficient_privilege — go through an API route with the service client instead.

**Medium/Low (still open)**
7. No FK on `vmt_bracket_picks.match_number`; `pick_team` is unvalidated free text.
8. `recalculate-scores` is unauthenticated when `NODE_ENV !== 'production'`; GET triggers POST.
9. `admin/delete-submission` doesn't log to `vmt_admin_log` or remove drafts — untraceable.
10. Email enumeration via `check-submission` + draft API; final-details fetch lacks try/catch;
    `me/submission-picks` uses `.maybeSingle()` on non-unique `user_id`; `vmt_drafts` full of test rows.

Recommendation: enable PITR; destructive migrations must start with
`CREATE TABLE ..._backup AS SELECT ...`.

### Supabase access (updated June 9)

Desktop Claude Code sessions DO have the claude.ai Supabase MCP connector (web sessions may not).
Project id `poztuyxcwumqyeqkgqym` ("Tripper" — shared project, vmt_* tables live alongside an
unrelated trip-planning app's tables). `supabase_migrations.schema_migrations` does NOT contain
manually-run SQL Editor migrations (e.g. the 20260528 one).

## Older status — VM-Bibeln / World Cup Guide (May 21, 2026)

The active page is `app/worldcup-guide/page.tsx`.

Recent commits already pushed to `master`:

- `edf4375 Add photography to world cup guide`
- `a28d351 Fix player stats export compatibility`
- `ed74464 Improve world cup guide player photos`

Latest handoff change:

- Hero stats strip was removed because it looked too large and generic.
- The VM guide hero now has compact “Snabbkoll” facts on the right on desktop, and a tighter 2x2 fact block on mobile.
- “12 · A–L” copy was replaced with clearer “12 grupper” language.
- `GroupsTab` intro now explains: two best teams per group advance, plus eight best third-place teams.
- `FavoritesTab` is no longer image-card based. It is now a compact clickable ranking list.
- Favorites percentages are explicitly labeled as estimated **titelchans**.
- Favorites now include a small method panel explaining the estimate: squad quality, group path, likely knockout path, and tournament pedigree.
- Favorite rows expand on click with short reasoning and key player.
- `DarkHorsesTab` / “Skrällchanser” is also no longer image-card based.
- Skrällchanser uses clickable rows with **rimligt tak** (e.g. Semifinal/Kvartsfinal), not percentage or 8/10 strength.
- Skrällchanser has a short method panel explaining that it is not title probability; it weighs group path, defensive stability, match-winners, and knockout experience.
- `npm run build` passed after these changes.

Important design direction from Erik:

- Favoriter and Skrällchanser should feel more like editorial odds/ranking lists than image galleries.
- Avoid generic AI-looking cards and oversized statistic blocks.
- Use compact, polished rows with click-to-expand analysis, similar interaction principle to player cards but more list-like.
- Explain what numbers mean directly in the UI. “Skrällchanser” should not imply chance to win the whole tournament.
- Keep the design dense, intentional, and magazine/editorial rather than decorative.

Known unrelated dirty files to leave alone unless asked:

- `.claude/settings.local.json`
- `.claude/launch.json`
- `.claude/worktrees/`
- `lib/player-stats-sync.ts`
- `scripts/seed-player-stats.ts`
- `scripts/check-player-stats.ts`
- `supabase/migrations/20260519143000_add_api_football_stats.sql`
- `supabase/migrations/20260520113000_add_player_stats_source_metadata.sql`
- `supabase/migrations/20260520131500_add_player_stats_appearances_and_starts.sql`
- `supabase/vmt-schema.sql`
- `public/images/flags/`

## Supabase access

No Supabase CLI or MCP tools available in Claude Code web sessions.
SQL migrations must be applied manually via the Supabase dashboard SQL Editor.
The service role key is in Vercel env vars; API routes use `createServiceClient()`.
