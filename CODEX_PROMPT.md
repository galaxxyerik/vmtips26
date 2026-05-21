# Codex Prompt — vmtips26 fortsättning

## Kontext
vmtips26 är en privat svensk VM-tipsapp (Next.js 15 App Router, Tailwind, Supabase). Privat sluten sajt — upphovsrättsskyddade bilder är ok att använda.

Alla ändringar görs direkt på `master` och pushas till `origin/master` efter varje commit (alltid, utan att fråga).

## Senast gjort (commit 0f7f28e)

### Grupp-randomiseraren (lib/group-randomize.ts)
- `TEAM_SCORERS` är nu genomgånget och uppdaterat mot bekräftade VM 2026-trupper (via officiella truppkällor maj 2026).
- 10 svaghetslagen borttagna ur `TEAM_SCORERS` (inga förslag slumpas för dem): Haiti, Panama, Qatar, Curaçao, Nya Zeeland, Saudiarabien, Kap Verde, Irak, Jordanien, Uzbekistan.
- Korrigeringar per lag bl.a.: Neymar tillbaka (Brasilien), Memphis Depay tillbaka (Nederländerna, 8 mål i kval), Sardar Azmoun borttagen (Iran — officiellt utesluten), Nicolas Pépé tillbaka (Elfenbenskusten, FIFA-bekräftad), Inaki Williams (Ghana), Hannibal Mejbri (Tunisien), m.m.

### UI-förbättringar i group-stage (commit a96ab4c)
- Legendraden "1/X/2" är omdesignad till chip+etikett-rad (inte längre centrerat grå-text-pill).
- Scorer-knappen är omdesignad från bare `↺` till tydligare `↺ Slumpa`-knapp med border.

## Slump-systemet — kontrollera viktning (VIKTIG UPPGIFT)

Användaren undrar om slumpsystemet ger "rimliga" slumpar, dvs. att gruppfavoriterna har ganska stor sannolikhet att vinna sin grupp.

**Befintlig implementation** (`lib/group-randomize.ts`):
- `STRENGTH`-mappen ger varje lag ett styrkebetyg (30–90).
- `randomMatchPick(homeTeam, awayTeam)` räknar `diff = styrka(hemma) + 5 − styrka(borta)` och väljer 1/X/2-sannolikheter:
  ```
  diff ≥ 20  → [60%, 25%, 15%]
  diff ≥ 10  → [50%, 28%, 22%]
  diff ≥ −9  → [38%, 30%, 32%]   ← nära jämna lag
  diff ≥ −19 → [22%, 28%, 50%]
  annars     → [15%, 25%, 60%]
  ```
- `randomizeGroupPicks` anropar `randomMatchPick` för varje match och returnerar en hel grupps picks.

**Slutsats:** Mekanismen ÄR viktad på matchnivå — starka lag vinner mer sannolikt varje enskild match. Eftersom grupptabellen uppstår av alla 6 matchresultat samlat, tenderar favoriter att hamna i topp naturligt.

**Saker att kontrollera/förbättra:**
1. Är `STRENGTH`-värdena rimliga för VM 2026? T.ex. Norge (Haaland, 16 mål i kval) är satt till 58 — kanske för lågt? Kanada som värdnation har fördel. Kolla om några lag verkar skevt rankade.
2. Är trösklarna rimliga? I nuläget är diff ±9 "jämnt" — det innebär att lag med upp till 9 styrkepoängs skillnad betraktas som jämna. Kan det vara för brett?
3. Funktionen slumpar bara på matchnivå och returnerar picks — den simulerar inte hela grupptabellen. Det finns ingen garanti att den bästa pickade ordningen i grupptabellen hänger ihop med matcherna. Det är oklart om grupp-tabell-ordningen också slumpas. Kolla `app/onboarding/group-stage/page.tsx` — hanteras `onRandomize` och grupp-tabellen separat?

## Pending UI-uppgifter (ej gjorda än)

### 1. Landing page — "Påbörja ditt tips" för nära footer
Knappen hamnar precis mot den nedre strap-listen. Lägg till `pb-24 sm:pb-32` på hero-content-diven i `components/LandingPage.tsx`:
```tsx
<div className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-16 pb-24 sm:pb-32 max-w-2xl">
```

### 2. Dashboard hero — NFL-stadion ser fel ut
`nrg-stadium.jpg` är NFL. Byt till `friends-arena-stockholm.jpg` i `app/dashboard/page.tsx`:
```tsx
src="/images/friends-arena-stockholm.jpg"
alt="Friends Arena i Stockholm — Sveriges hemmaplan"
```

### 3. VM-guide featured players — återställ Fotmob-foton
I `app/worldcup-guide/page.tsx` togs spelarbilderna i Nyckelspelare-sektionen bort. Lägg tillbaka `PLAYER_IMAGE_FALLBACKS` och bildslot i `SwedenTab()`. Se CODEX_PROMPT (förra versionen) för exakt kod.

### 4. VM-guide — öka rubrikstorlekar
- Spelarnamn: `text-sm` → `text-base`
- Landnamn i DarkHorsesTab: lägg till `text-base`
- Grupprubrik i GroupsTab: `text-sm` → `text-base`

### 5. Landing page — logout saknas för inloggade
`app/page.tsx` — skicka `userName={user?.email ?? null}` till `LandingPage`.
`components/LandingPage.tsx` — ersätt inline `<nav>` med `<NavBar userName={userName ?? null} />`.

## Uncommitted filer (ej att röra utan anledning)
Dessa filer är modifierade/untracked men inte committade — de tillhör ett separat spår (player-stats/API-integration) och ska lämnas orörda om inte användaren specifikt ber om det:
- `app/worldcup-guide/page.tsx`
- `data/player-stats.ts`, `lib/player-stats-config.ts`, `lib/player-stats-sync.ts`, `lib/player-stats-types.ts`
- `scripts/seed-player-stats.ts`, `scripts/check-player-stats.ts`
- `supabase/migrations/20260519143000_add_api_football_stats.sql`
- `supabase/migrations/20260520113000_add_player_stats_source_metadata.sql`
- `supabase/migrations/20260520131500_add_player_stats_appearances_and_starts.sql`

## Tillgängliga bilder i /public/images/
```
att-stadium.jpg              gyokeres-arsenal-portrait.jpg   sofi-stadium-aerial.jpg
bergvall-action.jpg          gyokeres-fotmob.png              sweden-fans.jpg
bergvall-fotmob.png          gyokeres-wc-qual-action.jpg      sweden-poland-wc-qual-1.jpg
elanga-action.jpg            isak-action-lfc.webp             sweden-poland-wc-qual-2.jpg
elanga-fotmob.png            isak-body-lfc.webp               sweden-squad-2026.jpg
friends-arena-stockholm.jpg  isak-fotmob.png                  tunisia-team.jpg
gyokeres-action.jpg          isak-portrait.jpg                van-dijk-portrait.jpg
gyokeres-arsenal-action2.jpg isak-sweden-action.jpg           wc-trophy.jpg
gyokeres-arsenal-celebration.jpg  japan-team-wc2022.jpg       metlife-stadium.jpg
gyokeres-arsenal-kit.jpg     lindelof-action.jpg              nrg-stadium.jpg
gyokeres-arsenal-penalty.jpg lindelof-fotmob.png              nrg-stadium-interior.jpg
                             potter-fotmob.png / potter-portrait.jpg
                             potm.avif
```

## Commit-rutin
```
git add [filer] && git commit -m "..." && git push origin master
```

## Codex-prompt att klistra in

> Fortsätt arbetet med VM-tips 26 (galaxxyerik/vmtips26). Läs CLAUDE.md i repots rot för fullständig stackkontext, och CODEX_PROMPT.md för vad som gjorts senast och vad som är pending.
>
> Börja med att kontrollera slump-viktningen i lib/group-randomize.ts och app/onboarding/group-stage/page.tsx: stämmer STRENGTH-värdena för VM 2026, och ger systemet rimliga sannolikheter att gruppfavoriterna vinner? Kolla även om grupp-tabell-ordningen (inte bara 1/X/2-picks) också slumpas konsekvent med matchresultaten.
>
> Fortsätt sedan med de 5 pending UI-uppgifterna i CODEX_PROMPT.md i den ordning de listas.
