# CODEX_PROMPT — vmtips26 (aktuell per maj 2026)

## Systembeskrivning

vmtips26 är en privat svensk VM-tipsapp för ~50 vänner. Byggt på:
- **Next.js 15** App Router, TypeScript, Tailwind CSS
- **Supabase** (Postgres + Auth) via `@supabase/ssr`
- **Vercel** — auto-deploys från `master`
- Allt UI på svenska. Privat sluten sajt — upphovsrättsskyddade bilder ok.

**Workflow:** Committa direkt till `master` och pusha till `origin/master` efter varje avslutad ändring, utan att fråga.

---

## Onboarding-flöde (3 steg)

1. `/` — LandingPage: namn + e-post → cross-device draft sync via `vmt_drafts`
2. `/onboarding/group-stage` — 72 gruppspelsmatcher (1/X/2), grupptabeller, 8 tredjeplatser, gruppskyttekung
3. `/onboarding/bracket` — 32 slutspelsmatcher (R32→Final), kaskadereset vid ändrade grupper
4. `/onboarding/final-details` — turneringsskyttekung, lösenord (valfritt), Swish-bekräftelse
5. Submit → `POST /api/submit-picks` → `clearDraft()` → `/dashboard?submitted=true`

### Redigera tips
Inloggad användare → `/dashboard/[submissionId]` → "Uppdatera mitt tips" → återanvänder onboarding med `submissionId` i draft → `submit-picks` hanterar update. Möjligt fram till deadline (11 juni 18:00 UTC = 20:00 Stockholm).

---

## Auth

- Supabase password auth (`signInWithPassword`)
- Lösenord skapas valfritt vid submit (`supabase.auth.admin.createUser`)
- `/login` → `/dashboard/[submissionId]` om submission finns
- `/forgot-password` → reset-mail → `/auth/callback?next=/reset-password` → `/reset-password`
- `app/auth/callback/route.ts` — byter Supabase-kod mot session (måste stå i Supabase "Allowed redirect URLs")

---

## Deadline & Locking

- **`lib/deadlines.ts`**: `PICKS_DEADLINE_AT = new Date('2026-06-11T18:00:00Z')` (= 20:00 CEST)
- `canEditPicks()` kontrolleras i backend (`submit-picks`) och frontend
- System config kan override:a via `global_lock` i `vmt_system_config`
- Admin bypasser alltid deadline via `adminOverride: true` i submit-picks
- Individuella submissions kan låsas via `admin_locked` i `vmt_submissions`

---

## Databasschema

### Kärnatabeller
| Tabell | Syfte |
|--------|-------|
| `vmt_matches` | 104 matcher; `result`, `manual_result`, `manual_winner`, `manual_override` |
| `vmt_submissions` | Deltagare; `confirmed`, `total_points`, `admin_locked`, `admin_edited_at`, `admin_edited_by`, `admin_note` |
| `vmt_group_picks` | 1/X/2 per match per submission |
| `vmt_group_table_picks` | Grupptabellordning |
| `vmt_third_place_picks` | Tredjeplatser per grupp |
| `vmt_group_scorer_picks` | Gruppskyttekung per grupp |
| `vmt_tournament_scorer_pick` | Turneringsskyttekung |
| `vmt_bracket_picks` | Slutspelspicks per matchnummer |
| `vmt_drafts` | Cross-device draft sync |
| `vmt_notifications` | Nya tips (admin notis) |
| `vmt_sync_log` | Sista API-sync-tidstämplar |
| `vmt_admin_log` | Audit log för adminåtgärder |
| `vmt_system_config` | key/value config (se nedan) |

### vmt_system_config — nycklar
| Nyckel | Funktion |
|--------|----------|
| `global_lock` | Stänger alla tips (override av deadline) |
| `emergency_mode` | Fryser live-updates, scoring och matchsync |
| `disable_submissions` | Stänger nya anmälningar |
| `maintenance_banner` | Banner-text (tom = ingen banner) |
| `scoring_frozen` | Stoppar recalculate-scores |
| `admin_last_seen` | ISO-tidsstämpel för senaste admin-besök (används för NY-badge) |

**Migrationer att applicera manuellt i Supabase:**
- `supabase/migrations/20260521200000_admin_system.sql` ✅ **REDAN APPLICERAD**

---

## Nyckelfiler

| Fil | Syfte |
|-----|-------|
| `lib/types.ts` | VmtMatch, OnboardingDraft, Pick, GroupLabel |
| `lib/deadlines.ts` | `PICKS_DEADLINE_AT`, `canEditPicks()` |
| `lib/scoring.ts` | `calculateScore()` — full poängberäkning inkl. annan väg |
| `lib/bracket-logic.ts` | Bygger R32-bracket från grupputfall (FIFA Annex C) |
| `lib/group-randomize.ts` | Viktad slumpgenerator + TEAM_SCORERS |
| `lib/onboarding-storage.ts` | localStorage draft + server sync |
| `lib/system-config.ts` | `getSystemConfig()` / `setSystemConfig()` mot `vmt_system_config` |
| `lib/admin-guard.ts` | `requireAdmin(req)` + `logAdminAction()` |
| `components/LandingPage.tsx` | Entry form + resume modal |
| `components/NavBar.tsx` | Sticky nav, "Tippa nu →" / "Logga ut" |
| `app/api/submit-picks/route.ts` | Final submit — skapar/uppdaterar alla picks; respekterar global_lock; adminOverride bypass |
| `app/api/draft/route.ts` | GET/POST/DELETE draft per e-post |
| `app/api/admin/recalculate-scores/route.ts` | Räknar om total_points; använder manual_result när manual_override; hoppar om scoring_frozen |
| `app/api/admin/match-override/route.ts` | Manuellt matchresultat (prioriteras i scoring) |
| `app/api/admin/system-config/route.ts` | Läs/skriv system config |
| `app/api/admin/lock-submission/route.ts` | Lås/lås upp individuell submission |
| `app/api/admin/add-note/route.ts` | Admin-anteckning på submission |
| `app/api/admin/export/route.ts` | CSV-export (deltagare, tips, poäng, notat) |
| `app/api/cron/sync-matches/route.ts` | Synkar matcher + triggar recalculate-scores; hoppar om emergency_mode |
| `app/admin/page.tsx` | Server component — hämtar all data, sätter admin_last_seen, renderar ControlRoom |
| `app/admin/ControlRoom.tsx` | Client component — tabbar: Översikt / Deltagare / Matcher / System; toasts; optimistic UI |
| `app/admin/AdminSubmissionRow.tsx` | Expanderbar rad med lock/note-knappar och NY-badge |
| `app/dashboard/page.tsx` | Public leaderboard + deltagarlista |
| `app/dashboard/[userId]/page.tsx` | Tipsvisning: owner=redigerbar, confirmed other=publik |
| `app/dashboard/[userId]/MyTipDetails.tsx` | Owner-vy med "Uppdatera mitt tips"-knapp |
| `app/dashboard/[userId]/PublicTipSummary.tsx` | Publik vy för andra bekräftade deltagare |
| `app/worldcup-guide/page.tsx` | VM-Bibeln (guide med grupper, favoriter, skrällchanser, spelarlexikon) |

---

## Poängsystem

| Kategori | Poäng |
|----------|-------|
| Rätt 1/X/2 | 1 p |
| Exakt plats i grupptabell | 2 p |
| En plats fel i grupptabell | 1 p |
| Rätt trea vidare | 1 p |
| Rätt gruppskyttekung | 3 p |
| Slutspel rätt väg (R32/R16/QF/SF/Bronze/Final) | 2/3/4/5/3/6 p |
| Slutspel annan väg | 1/1,5/2/2,5/1,5/3 p |
| Turneringsskyttekung | 5 p |

`calculateScore()` i `lib/scoring.ts` hanterar allt. Föredrar `manual_result` framför `result` i matchdata.
`POST /api/admin/recalculate-scores` — räknar om alla. Triggas automatiskt av sync-matches.

---

## Admin-system (Tournament Control Room)

### Åtkomstkontroll
Endast `eeengstrand@gmail.com` har admin-access. `lib/admin-guard.ts` exporterar `requireAdmin(req)`.

### Admin-åtgärder
| Åtgärd | Route |
|--------|-------|
| Bekräfta/avbekräfta betalning | `POST /api/admin/toggle-confirm` |
| Lås/lås upp submission | `POST /api/admin/lock-submission` |
| Redigera tips (admin) | `POST /api/submit-picks` med `adminOverride: true` |
| Manuellt matchresultat | `POST /api/admin/match-override` |
| System config | `POST /api/admin/system-config` |
| Admin-anteckning | `POST /api/admin/add-note` |
| Räkna om poäng | `POST /api/admin/recalculate-scores` |
| CSV-export | `GET /api/admin/export` |
| Radera submission | `POST /api/admin/delete-submission` |

### Audit Log (`vmt_admin_log`)
Kolumner: `id`, `admin_email`, `action`, `target_id`, `target_name`, `details` (jsonb), `created_at`.
Loggas via `logAdminAction()` i `lib/admin-guard.ts` för alla kritiska åtgärder.

### NY-badge
`vmt_system_config` key `admin_last_seen` uppdateras varje gång admin öppnar `/admin`.
Submissions med `submitted_at > admin_last_seen` märks som nya med gul NY-chip — fungerar cross-device.

### Control Room-tabbar
- **Översikt** — stats, leaderboard, aggregerade picks, systemstatus-alerts
- **Deltagare** — alla submissions med lock/note/confirm/radera; NY-badge på nya
- **Matcher** — override per grupp eller slutspelsrunda + force recalculate
- **System** — toggle-switchar för all system config, underhållsbanner, CSV-export, verktyg

---

## Scoring triggerkedja
```
Vercel cron → GET /api/cron/sync-matches
  → (avbryt om emergency_mode)
  → syncMatches() (lib/match-sync.ts) → POST /api/admin/recalculate-scores
    → (avbryt om scoring_frozen)
    → calculateScore() per submission (använder manual_result om manual_override)
    → UPDATE vmt_submissions SET total_points
```

---

## Dirty filer (ej committa utan explicit begäran)
- `lib/player-stats-sync.ts`
- `scripts/seed-player-stats.ts`, `scripts/check-player-stats.ts`
- `supabase/migrations/20260519143000_add_api_football_stats.sql`
- `supabase/migrations/20260520113000_add_player_stats_source_metadata.sql`
- `supabase/migrations/20260520131500_add_player_stats_appearances_and_starts.sql`
- `supabase/vmt-schema.sql`
- `.claude/settings.local.json`, `.claude/launch.json`
- `public/images/flags/`
