# VM-TIPS 26

World Cup 2026 prediction game. Swedish-language, built for a friend group.  
Live at **https://vmtips26.vercel.app**

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 App Router (TypeScript) |
| Styling | Tailwind CSS — custom design system (navy-950, swe-yellow #FFCD00, Barlow Condensed Black, no rounded corners) |
| Database | Supabase (Postgres + Auth) |
| Deploy | Vercel |
| Email | Resend (submission notification to admin) |
| Match data | API-Football (cron sync) |

---

## Project structure

```
app/
  page.tsx                        Landing page (redirects logged-in users with a submission → /dashboard)
  layout.tsx                      Root layout — fetches auth + vmt_page_content, wraps in ContentProvider
  (auth)/login/page.tsx           Admin login
  admin/
    page.tsx                      Admin dashboard (protected: eeengstrand@gmail.com only)
    AdminActions.tsx              ToggleConfirmButton + DeleteButton (client, with error handling)
    SetupAdminButton.tsx          One-time admin account setup button
  dashboard/
    page.tsx                      Leaderboard (pre-June-11: countdown+stats, post: ranked table)
    [userId]/page.tsx             Individual submission profile page
  onboarding/
    group-stage/page.tsx          Step 1 — pick 1/X/2 for all 72 group matches, rank groups, pick 8 third-placers + group scorers
    bracket/page.tsx              Step 2 — pick knockout bracket (R32→R16→QF→SF→Bronze→Final)
    final-details/page.tsx        Step 3 — tournament scorer, optional password, Swish confirmation
    success/page.tsx              Post-submit confirmation page
  regler/page.tsx                 Rules and scoring system
  worldcup-guide/page.tsx         VM-bibel: groups, stars, talents, Sweden, favorites, dark horses, facts
  api/
    submit-picks/route.ts         POST — validates + writes all picks to Supabase
    admin/
      toggle-confirm/route.ts     POST — confirm/unconfirm a submission (admin-authed)
      delete-submission/route.ts  POST — cascade-delete a submission (admin-authed)
      update-content/route.ts     POST — upsert vmt_page_content key/value (admin-authed)
    setup-admin/route.ts          POST — create/reset admin Supabase Auth account (requires admin session + ADMIN_PASSWORD env)
    cron/sync-matches/route.ts    GET  — sync match results from API-Football (Bearer CRON_SECRET)

components/
  LandingPage.tsx                 Client component — hero, name/email form, resume-draft modal
  NavBar.tsx                      Sticky nav — reads isAdmin from ContentContext, shows logout if logged in
  Footer.tsx                      Discreet footer with Admin link
  Editable.tsx                    Inline text/image editing for admin (EditableImage + Editable)
  AdminEditBar.tsx                Floating "Redigera sida" button (admin-only, toggles editMode)

contexts/
  AdminEditContext.tsx            ContentProvider — holds vmt_page_content, isAdmin, editMode

lib/
  types.ts                        VmtMatch, OnboardingDraft, Pick, GroupLabel, GROUPS
  onboarding-storage.ts           localStorage draft helpers: loadDraft, saveDraft (try/catch), computeGroupStandings
  bracket-logic.ts                buildR32Bracket — Annex C seeding logic for 495 third-place combinations
  supabase/
    client.ts                     Browser Supabase client
    server.ts                     Server Supabase client + service role client

supabase/
  vmt-schema.sql                  Full DB schema
  vmt-matches.sql                 All 72 group stage matches (FIFA official schedule v17)
```

---

## Database schema (key tables)

```
vmt_submissions       id, user_id, name, email, submitted_at, confirmed, total_points
vmt_matches           id, match_number(unique), phase, group_label, home_team, away_team, kickoff, venue, home_score, away_score, result, status
vmt_group_picks       submission_id, match_id, pick ('1'|'X'|'2')
vmt_group_table_picks submission_id, group_label, position(1-4), team
vmt_third_place_picks submission_id, group_label, selected(bool)
vmt_group_scorer_picks submission_id, group_label, player_name
vmt_tournament_scorer_pick submission_id, player_name
vmt_bracket_picks     submission_id, match_number, pick_team, round
vmt_page_content      key(PK), value, updated_at    ← admin-editable text/images
vmt_notifications     id, type, payload(jsonb), created_at
```

**Important:** `vmt_bracket_picks.pick_team` is the correct field name (NOT `team_name`).  
`vmt_tournament_scorer_pick` and `vmt_group_scorer_picks` do NOT have a `team` column.

---

## Environment variables

See `.env.local.example`. Required:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
API_FOOTBALL_KEY          # API-Football v3 for match sync
RESEND_API_KEY            # Email on submission
CRON_SECRET               # Bearer token for /api/cron/sync-matches
ADMIN_EMAIL               # defaults to eeengstrand@gmail.com
ADMIN_PASSWORD            # Used by setup-admin endpoint (not hardcoded)
```

---

## Onboarding flow

1. **Landing** (`/`) — user enters name + email → localStorage draft created
2. **Group stage** (`/onboarding/group-stage`) — 12 groups (A–L), 6 matches each, 72 total. Pick 1/X/2. After all 6 in a group are picked, auto-sort the table (pts→wins→draws→alpha). Manually re-order with arrows. Check 8 of 12 third-placers to advance. Enter group scorer for each group. Changing match picks or reordering tables clears bracketPicks (with notice).
3. **Bracket** (`/onboarding/bracket`) — R32 seeded by Annex C logic from group results. Pick R32→R16→QF→SF→Final + Bronze. All 32 matches required. Click a picked team again to deselect (clears downstream). Bronze match is pickable (Förlorare SF1 vs Förlorare SF2).
4. **Final details** (`/onboarding/final-details`) — tournament scorer (5pt bonus), optional password (creates Supabase Auth account), Swish confirmation checkbox. Submits to `/api/submit-picks`.
5. **Success** (`/onboarding/success`) — draft cleared, user reminded to Swish 100 kr.

---

## Scoring (not yet implemented server-side — structure is ready)

| Category | Points |
|---|---|
| Group match result (1/X/2) | 1 pt × 36 matches = max 36 |
| Group table position (exact) | 2 pt/team × 12 groups × 4 = max 96 |
| Group table position (off by 1) | 1 pt |
| Third-place advancing correctly | 1 pt × 8 = max 8 |
| Group scorer correct | 3 pt × 12 = max 36 |
| Tournament scorer correct | 5 pt bonus |
| Bracket (varies by round, halved if correct team wrong path) | see /regler |

`vmt_submissions.total_points` is a stored numeric field. The scoring calculation that populates it has **not been implemented** — it needs to be written and triggered after match results are synced.

---

## Admin

- URL: `/admin` (redirect to `/` if not `ADMIN_EMAIL`)
- Confirm/unconfirm submissions (100 kr Swish payment received)
- Delete submissions (cascade)
- See aggregate top tournament scorers and VM-winners across confirmed submissions
- Edit page content inline via "✎ Redigera sida" button (stores in `vmt_page_content`)

**To set up admin account:** Log in as admin → go to `/admin` → click "Kör setup-admin" (reads password from `ADMIN_PASSWORD` env var).

---

## Known gaps / next work items

1. **Scoring engine** — `total_points` is never calculated. Need a function (SQL or server) that scores each submission after match results are synced. This is the biggest missing piece.
2. **Points display on leaderboard** — dashboard shows `total_points` but they're always 0 until the engine is built.
3. **Profile page `[userId]`** — shows name + points but not the actual picks. Could be expanded to show full bracket + group picks.
4. **Match result sync** — `/api/cron/sync-matches` syncs from API-Football but the league ID (1) and season (2026) may need verifying once tournament starts.
5. **Email on submission** — `RESEND_API_KEY` is referenced in env but `/api/submit-picks` does not currently call Resend. The notification row is inserted to `vmt_notifications` but no email is sent.
6. **RLS policies** — schema enables RLS on `vmt_page_content` with public read. Other tables may need RLS review.

---

## Design system

- **Colors:** `navy-950` (bg), `navy-900` (cards), `swe-yellow` (#FFCD00), `pitch-400` (green confirmations), `loss-500` (red errors)
- **Font:** Barlow Condensed Black (`font-display font-black`) for headings/labels, system sans for body
- **Borders:** 1px `border-white/10`, no rounded corners, no box shadows
- **Labels:** `<div className="label">` — small uppercase tracked caps
- **Buttons:** `btn-primary` (yellow), `btn-secondary` (outlined)
