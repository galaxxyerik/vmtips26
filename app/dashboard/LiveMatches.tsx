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
  status: 'scheduled' | 'live' | 'finished'
}

interface LiveApiMatch {
  fixtureId: number
  homeTeam: string
  awayTeam: string
  homeTeamApi?: string
  awayTeamApi?: string
  homeScore: number | null
  awayScore: number | null
  elapsed: number | null
  status: string
  events?: {
    time?: { elapsed?: number | null }
    team?: { name?: string }
    player?: { name?: string }
    type?: string
    detail?: string
  }[]
}

function isLiveWindow(match: MatchRow) {
  const kickoff = new Date(match.kickoff).getTime()
  const now = Date.now()
  return kickoff <= now && now <= kickoff + 130 * 60 * 1000
}

function scorersText(scorers: GoalScorer[] | null | undefined) {
  if (!scorers?.length) return '–'
  return scorers.map(s => `${s.player}${s.minute ? ` ${s.minute}'` : ''}`).join(', ')
}

function resultPick(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null
  if (homeScore > awayScore) return '1'
  if (homeScore === awayScore) return 'X'
  return '2'
}

function scorersFromEvents(match: LiveApiMatch, team: string): GoalScorer[] {
  return (match.events ?? [])
    .filter(event => event.type === 'Goal' && event.team?.name === team && event.detail !== 'Missed Penalty')
    .map(event => ({
      player: event.player?.name ?? 'Okänd målskytt',
      minute: event.time?.elapsed ?? null,
    }))
}

export default function LiveMatches({
  initialMatches,
  userPicks,
}: {
  initialMatches: MatchRow[]
  userPicks: Record<number, string>
}) {
  const [matches, setMatches] = useState(initialMatches)
  const [elapsedByMatch, setElapsedByMatch] = useState<Record<number, number | null>>({})
  const shouldPoll = useMemo(() => initialMatches.some(isLiveWindow), [initialMatches])

  useEffect(() => {
    if (!shouldPoll) return

    let active = true
    async function poll() {
      try {
        const res = await fetch('/api/matches/live')
        const json = await res.json()
        if (!active || !json.matches) return
        setElapsedByMatch(Object.fromEntries(
          json.matches.map((row: LiveApiMatch) => [row.fixtureId, row.elapsed])
        ))
        setMatches(current => current.map(match => {
          const live = json.matches.find((row: LiveApiMatch) => row.fixtureId === match.match_number)
          if (!live) return match
          return {
            ...match,
            home_score: live.homeScore,
            away_score: live.awayScore,
            home_goal_scorers: scorersFromEvents(live, live.homeTeamApi ?? live.homeTeam),
            away_goal_scorers: scorersFromEvents(live, live.awayTeamApi ?? live.awayTeam),
            status: 'live',
          }
        }))
      } catch {
        // Livepanelen får hellre visa senaste DB-läget än störa sidan.
      }
    }

    poll()
    const id = window.setInterval(poll, 60_000)
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
          const livePick = resultPick(match.home_score, match.away_score)
          const tippedRightNow = livePick && userPicks[match.id] === livePick
          return (
            <div key={match.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-display font-black uppercase tracking-wide text-white text-base">
                    {match.home_team} {match.home_score ?? 0}–{match.away_score ?? 0} {match.away_team}
                    <span className="ml-2 text-xs text-swe-yellow">
                      LIVE{elapsedByMatch[match.match_number ?? 0] ? ` ${elapsedByMatch[match.match_number ?? 0]}'` : ''}
                    </span>
                  </div>
                  <div className="mt-1 grid gap-1 text-[11px] text-white/45">
                    <div>{match.home_team}: {scorersText(match.home_goal_scorers)}</div>
                    <div>{match.away_team}: {scorersText(match.away_goal_scorers)}</div>
                  </div>
                </div>
                {tippedRightNow && (
                  <div className="border border-pitch-500/30 bg-pitch-900/20 px-3 py-1 text-xs font-display font-black uppercase tracking-wide text-pitch-400">
                    Ditt tips leder
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
