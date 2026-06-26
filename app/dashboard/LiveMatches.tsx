'use client'

import { useEffect, useMemo, useState } from 'react'

interface GoalScorer {
  player: string
  minute: number | null
}

interface MatchRow {
  id: number
  match_number: number | null
  home_team: string
  away_team: string
  kickoff: string
  home_score: number | null
  away_score: number | null
  home_goal_scorers: GoalScorer[] | null
  away_goal_scorers: GoalScorer[] | null
  result: '1' | 'X' | '2' | null
  live_minute: string | null
  status: 'scheduled' | 'live' | 'finished'
}

// Shape returned by /api/matches/live
interface LiveApiMatch {
  fixtureId: number | null
  homeScore: number | null
  awayScore: number | null
  status: string
  result: '1' | 'X' | '2' | null
  minute?: string | null
  homeGoalScorers?: GoalScorer[] | null
  awayGoalScorers?: GoalScorer[] | null
}

const PICK_LABELS: Record<string, string> = { '1': 'hemmaseger', X: 'oavgjort', '2': 'bortaseger' }

function isLiveWindow(match: MatchRow) {
  const kickoff = new Date(match.kickoff).getTime()
  const now = Date.now()
  return kickoff <= now && now <= kickoff + 130 * 60 * 1000
}

function scorersText(scorers: GoalScorer[] | null | undefined) {
  if (!scorers?.length) return '–'
  return scorers.map(s => `${s.player}${s.minute ? ` ${s.minute}'` : ''}`).join(', ')
}

function resultFromScore(homeScore: number | null, awayScore: number | null): '1' | 'X' | '2' | null {
  if (homeScore === null || awayScore === null) return null
  if (homeScore > awayScore) return '1'
  if (homeScore === awayScore) return 'X'
  return '2'
}

export default function LiveMatches({
  initialMatches,
  userPicks,
}: {
  initialMatches: MatchRow[]
  userPicks: Record<number, string>
}) {
  const [matches, setMatches] = useState(initialMatches)
  const shouldPoll = useMemo(() => initialMatches.some(isLiveWindow), [initialMatches])

  useEffect(() => {
    if (!shouldPoll) return

    let active = true
    async function poll() {
      try {
        const res = await fetch('/api/matches/live')
        const json = await res.json()
        if (!active || !json.matches) return
        setMatches(current => current.map(match => {
          const live = json.matches.find((row: LiveApiMatch) => row.fixtureId === match.match_number)
          if (!live) return match
          return {
            ...match,
            home_score: live.homeScore,
            away_score: live.awayScore,
            // Keep DB scorers if the live payload doesn't carry any (the scrape
            // sources don't provide goal scorers — only API-Football does).
            home_goal_scorers: live.homeGoalScorers?.length ? live.homeGoalScorers : match.home_goal_scorers,
            away_goal_scorers: live.awayGoalScorers?.length ? live.awayGoalScorers : match.away_goal_scorers,
            result: live.result ?? match.result,
            live_minute: live.minute ?? match.live_minute,
            status: (live.status as MatchRow['status']) ?? match.status,
          }
        }))
      } catch {
        // Livepanelen får hellre visa senaste DB-läget än störa sidan.
      }
    }

    poll()
    const id = window.setInterval(poll, 30_000)
    return () => {
      active = false
      window.clearInterval(id)
    }
  }, [shouldPoll])

  const visible = matches.filter(match => match.status === 'live' || isLiveWindow(match))
  if (visible.length === 0) return null

  return (
    <div className="mb-6 border border-swe-yellow/25 bg-swe-yellow/5">
      <div className="flex items-center gap-2 border-b border-swe-yellow/15 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-swe-yellow animate-pulse" />
        <div className="label text-swe-yellow/70">Live just nu</div>
      </div>
      <div className="divide-y divide-white/5">
        {visible.map(match => {
          const finished = match.status === 'finished'
          const pick = userPicks[match.id] ?? null
          const currentResult = match.result ?? resultFromScore(match.home_score, match.away_score)
          const hasScore = match.home_score !== null && match.away_score !== null
          const hasScorers = !!match.home_goal_scorers?.length || !!match.away_goal_scorers?.length
          // Normalise ESPN's clock to e.g. "67'" (it sometimes omits the apostrophe)
          const minuteLabel = !finished && match.live_minute
            ? /[a-zA-Z']/.test(match.live_minute) ? match.live_minute : `${match.live_minute}'`
            : null

          // What to tell the user about their pick right now.
          let badge: { text: string; tone: 'good' | 'bad' | 'muted' } | null = null
          if (pick) {
            if (finished) {
              badge = currentResult === pick
                ? { text: 'Rätt ✓', tone: 'good' }
                : { text: 'Fel ✗', tone: 'bad' }
            } else if (!hasScore) {
              badge = { text: 'Avvaktar avspark', tone: 'muted' }
            } else {
              badge = currentResult === pick
                ? { text: 'Ditt tips leder', tone: 'good' }
                : { text: 'Ditt tips ligger under', tone: 'bad' }
            }
          }

          const toneClass =
            badge?.tone === 'good'
              ? 'border-pitch-500/30 bg-pitch-900/20 text-pitch-400'
              : badge?.tone === 'bad'
                ? 'border-loss-500/30 bg-loss-900/20 text-loss-500'
                : 'border-white/15 text-white/45'

          return (
            <div key={match.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display font-black uppercase tracking-wide text-white text-base">
                    {match.home_team} {match.home_score ?? 0}–{match.away_score ?? 0} {match.away_team}
                    <span className={`ml-2 text-xs ${finished ? 'text-white/40' : 'text-swe-yellow'}`}>
                      {finished ? 'SLUT' : minuteLabel ? `LIVE ${minuteLabel}` : 'LIVE'}
                    </span>
                  </div>
                  {/* Goal scorers — only when a source actually provides them */}
                  {hasScorers && (
                    <div className="mt-1 grid gap-1 text-[11px] text-white/45">
                      {!!match.home_goal_scorers?.length && (
                        <div>{match.home_team}: {scorersText(match.home_goal_scorers)}</div>
                      )}
                      {!!match.away_goal_scorers?.length && (
                        <div>{match.away_team}: {scorersText(match.away_goal_scorers)}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Always surface what the user tipped on this match */}
                <div className="flex shrink-0 items-center gap-3">
                  {pick ? (
                    <div className="text-right">
                      <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-white/40">
                        Du tippade
                      </div>
                      <div className="font-display font-black leading-none text-swe-yellow text-2xl">
                        {pick}
                        <span className="ml-1.5 align-middle font-sans text-[10px] uppercase tracking-wide text-white/45">
                          {PICK_LABELS[pick]}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-white/30">
                      Inget tips
                    </div>
                  )}
                  {badge && (
                    <div className={`border px-2.5 py-1 text-[11px] font-display font-black uppercase tracking-wide ${toneClass}`}>
                      {badge.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
