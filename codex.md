# VM-tips 26 — Codex context

Next.js 15 App Router · TypeScript · Tailwind · Supabase (Postgres + Auth) · Vercel

FIFA World Cup 2026 tipping game. 32 participants have submitted full tips (group picks,
bracket, scorers). Tournament starts 11 June 2026. Deployed at vmtips26.vercel.app.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 App Router, TypeScript, Tailwind CSS |
| Database | Supabase (project id `poztuyxcwumqyeqkgqym`) |
| Auth | Supabase Auth (email+password) |
| Deploy | Vercel (auto-deploy from `master`) |
| Live data | API-Football v3 (`v3.football.api-sports.io`) via `API_FOOTBALL_KEY` env var |

Swedish UI throughout. Swedish team names in DB (e.g. `Spanien`, `Brasilien`).
`lib/team-names.ts` has the EN→SV mapping.

---

## Key files

```
lib/
  api-football.ts         # apiFootballFetch() helper + 1 req/s rate limiter
  match-sync.ts           # syncMatches(): fetches fixtures + events, updates vmt_matches
  player-stats-sync.ts    # syncPlayerStats(): fetches club stats for ~100 players
  player-registry.ts      # PLAYER_REGISTRY: hardcoded player id + team mappings
  recalculate.ts          # recalculateAllScores() — unified scoring engine
  scoring.ts              # calculateScore() — pure function, no DB
  bracket-logic.ts        # buildR32Bracket() — FIFA Annex C seeding
  deadlines.ts            # PICKS_DEADLINE_AT = 2026-06-11T19:00:00Z (21:00 Stockholm)
  leaderboard.ts          # loadDashboardData() — leaderboard + point breakdown

app/api/
  cron/sync-matches/      # GET — called by Vercel cron 03:00 UTC nightly
  admin/recalculate-scores/ # POST — triggers recalculateAllScores()
  admin/scorer-results/   # POST — saves scorer facit to vmt_page_content
```

---

## Database tables (vmt_*)

| Table | Contents |
|-------|----------|
| `vmt_matches` | 104 fixture rows (match_number 1–104), result/manual_result/manual_override |
| `vmt_submissions` | One row per participant (name, email, total_points, confirmed) |
| `vmt_group_picks` | 1/X/2 for each of 72 group matches per submission |
| `vmt_group_table_picks` | Predicted table order per group per submission |
| `vmt_third_place_picks` | 8 selected third-place teams per submission |
| `vmt_group_scorer_picks` | Predicted top scorer per group per submission |
| `vmt_tournament_scorer_pick` | Predicted tournament top scorer per submission |
| `vmt_bracket_picks` | pick_team per match_number (73–104) per submission |
| `vmt_sync_log` | Last sync timestamps (sync_key: match_results / player_stats) |
| `vmt_player_stats` | Club stats per player (goals, assists, appearances, etc.) |
| `vmt_page_content` | Key-value store: scoring overrides, system config |
| `vmt_drafts` | In-progress tips (cross-device resume, cleared on submit) |

---

## Live data pipeline (current state)

**`syncMatches()`** in `lib/match-sync.ts`:
- Fetches all WC2026 fixtures from API-Football (`/fixtures?league=1&season=2026`)
- Maps each fixture to an existing `vmt_matches` row:
  - Group phase: matches on Swedish home+away team pair
  - KO phase: matches on phase + kickoff time (±3h tolerance)
  - **Never inserts new rows** — logs and skips unmatched fixtures
- Updates `result`, `home_goal_scorers`, `away_goal_scorers` on matched rows
- KO matches: also fills in real team names (home_team / away_team)
- Calls `recalculateAllScores()` after sync

**Cron schedule** (`vercel.json`): `0 3 * * *` (03:00 UTC = 05:00 Stockholm CEST)

**`syncPlayerStats()`** in `lib/player-stats-sync.ts`:
- Fetches club stats (goals, assists, appearances) for players in `PLAYER_REGISTRY`
- Writes to `vmt_player_stats` table

**Known gap**: there is no live/in-progress match sync. The cron runs once at 03:00,
so scores update the morning after each match day. A higher-frequency sync (every
15–30 min during match days) does not yet exist.

---

## Scoring (max 308 points)

| Phase | Exact | Annan väg |
|-------|-------|-----------|
| Group match result (×72) | 1p | — |
| Group table order (×12 groups) | 2p/team | 1p/team |
| Third-place selection (8 of 12) | 1p/team | — |
| Group top scorer (×12) | 3p | — |
| R32 (×16) | 2p | 1p |
| R16 (×8) | 3p | 1.5p |
| QF (×4) | 4p | 2p |
| SF (×2) | 5p | 2.5p |
| Bronze | 3p | 1.5p |
| Final | 6p | 3p |
| Tournament scorer | 5p | — |

"Annan väg" = team reached a later phase via a different path than you predicted.
Single scoring engine: `lib/scoring.ts` → `calculateScore()`.
Admin can override scorer facit via `/admin` form → `vmt_page_content`.

---

## What works / what's missing

**Works:**
- Full onboarding flow (group stage → bracket → final details → submit)
- Cross-device draft sync via `vmt_drafts`
- Admin panel: match results, manual overrides, scorer facit, recalculate scores
- Nightly sync cron (03:00 UTC) — updates results and recalculates points
- Leaderboard with point breakdown and score graph
- Bracket validation (submit-picks rejects impossible brackets)

**Not yet built:**
- Live/in-progress score updates (sub-hour cron or websocket)
- Live match ticker / match detail view for users
- Push notifications when a match finishes
- Player stats display page for users (data is fetched but not surfaced in UI)
- API-Football rate budget tracking / alerting

---

## API-Football notes

- Base URL: `https://v3.football.api-sports.io`
- Auth: `x-apisports-key` header
- WC 2026: `league=1`, `season=2026`
- Rate limit: 10 req/min on free tier; `apiFootballFetch()` enforces 1 req/s
- Relevant endpoints:
  - `/fixtures?league=1&season=2026` — all fixtures + scores
  - `/fixtures?id={id}` — single fixture with events
  - `/fixtures/events?fixture={id}` — goal scorers, cards
  - `/fixtures/statistics?fixture={id}` — possession, shots
  - `/players?league=1&season=2026&page={n}` — tournament player stats
  - `/players?id={id}&season=2026` — single player stats

---

## Constraints / rules

- **Never DELETE, TRUNCATE, DROP, or destructive UPDATE on user data tables**
  (vmt_submissions, vmt_group_picks, vmt_bracket_picks, vmt_group_table_picks,
  vmt_third_place_picks, vmt_group_scorer_picks, vmt_tournament_scorer_pick).
  Any migration touching these tables must CREATE a backup table first.
- Service role client (`createServiceClient()`) for all DB writes from API routes.
- Swedish team names everywhere in DB and UI — always translate via `teamNameSv()`.
- `scoring_frozen` flag in `vmt_page_content` blocks point recalculation.
- Admin email defined in `lib/admin-email.ts`.
