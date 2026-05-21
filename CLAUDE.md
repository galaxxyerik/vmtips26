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

- Work on feature branches, merge to `master` via PR (master is protected)
- Branch naming: `claude/<description>-<hash>`
- Vercel deploys automatically from `master`
- When rebasing before merge: `git fetch origin master && git rebase origin/master`

## Recent work (May 2026)

- Fixed JSX build error and stale bracket picks bug
- Rewrote bracket page: save flash, reset button, progress bar fix, safe area, orientation hint, touch targets
- Added **"↺ Slumpa grupp"** per group (weighted randomizer based on team strength)
- Added **"↺"** scorer randomizer (curated 2–3 candidates per team in `lib/group-randomize.ts`)
- Added **cross-device draft sync** via `vmt_drafts` Supabase table
- Added **1/X/2 deselect** in group stage (tap active button again to clear)
- Added **1 = hemmaseger · X = oavgjort · 2 = bortaseger** hint above match rows
- Added **"Turneringsformat"** section on rules page for football beginners

## Supabase access

No Supabase CLI or MCP tools available in Claude Code web sessions.
SQL migrations must be applied manually via the Supabase dashboard SQL Editor.
The service role key is in Vercel env vars; API routes use `createServiceClient()`.
