import type { SupabaseClient } from '@supabase/supabase-js'

export const TOURNAMENT_START = new Date('2026-06-11T19:00:00Z')

export const LEADERBOARD_MAX_POINTS = {
  group: 176,
  knockout: 91,
  bonus: 5,
  total: 272,
} as const

export type LeaderboardPhaseBreakdown = {
  group: number
  knockout: number
  bonus: number
}

export type LeaderboardEntry = {
  id: string
  userId: string | null
  name: string
  rank: number
  totalPoints: number
  rankMovement: number
  correctTips: number
  possibleTips: number
  isCurrentUser: boolean
  breakdown: LeaderboardPhaseBreakdown
}

export type LeaderboardGraphPoint = {
  label: string
  values: Record<string, number>
}

export type DashboardLeaderboardData = {
  isOpen: boolean
  isPreview: boolean
  lastUpdated: string
  maxPoints: typeof LEADERBOARD_MAX_POINTS
  entries: LeaderboardEntry[]
  graph: LeaderboardGraphPoint[]
  graphPlaceholder: boolean
}

type SubmissionRow = {
  id: string
  user_id: string | null
  name: string
  confirmed: boolean
  total_points: number | string | null
  submitted_at?: string | null
}

type MatchRow = {
  id: number
  kickoff: string
  result: '1' | 'X' | '2' | null
  status: string | null
  phase: string | null
}

type GroupPickRow = {
  submission_id: string
  match_id: number
  pick: '1' | 'X' | '2'
}

const PREVIEW_NAMES = [
  'Erik',
  'Johan',
  'Maja',
  'Linnea',
  'Oscar',
  'Sara',
  'Anton',
  'Nora',
  'Felix',
]

const PREVIEW_POINTS = [42, 39, 38, 34, 33, 29, 27, 24, 22]
const PREVIEW_MOVEMENT = [2, -1, 0, 3, -2, 1, 0, -1, 1]
const PREVIEW_CORRECT = [21, 19, 18, 17, 17, 15, 14, 12, 11]

function asNumber(value: number | string | null | undefined) {
  return typeof value === 'number' ? value : Number(value ?? 0)
}

function phaseBreakdown(totalPoints: number): LeaderboardPhaseBreakdown {
  const group = Math.min(totalPoints, LEADERBOARD_MAX_POINTS.group)
  const knockout = Math.min(Math.max(totalPoints - group, 0), LEADERBOARD_MAX_POINTS.knockout)
  const bonus = Math.min(Math.max(totalPoints - group - knockout, 0), LEADERBOARD_MAX_POINTS.bonus)

  return { group, knockout, bonus }
}

function rankEntries(entries: Omit<LeaderboardEntry, 'rank'>[]): LeaderboardEntry[] {
  return entries
    .sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name, 'sv'))
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

function makeFlatGraph(entries: Pick<LeaderboardEntry, 'id'>[]) {
  return [
    {
      label: 'Dag 1',
      values: Object.fromEntries(entries.map(entry => [entry.id, 0])),
    },
  ]
}

function previewLeaderboard(currentUserId: string | null, now: Date): DashboardLeaderboardData {
  const isOpen = now >= TOURNAMENT_START
  const entries = rankEntries(
    PREVIEW_NAMES.map((name, index) => {
      const id = `preview-${index}`
      const totalPoints = isOpen ? PREVIEW_POINTS[index] : 0

      return {
        id,
        userId: index === 0 ? (currentUserId ?? 'preview-current-user') : null,
        name,
        totalPoints,
        rankMovement: isOpen ? PREVIEW_MOVEMENT[index] : 0,
        correctTips: isOpen ? PREVIEW_CORRECT[index] : 0,
        possibleTips: isOpen ? 24 : 0,
        isCurrentUser: index === 0,
        breakdown: phaseBreakdown(totalPoints),
      }
    })
  )

  const graph: LeaderboardGraphPoint[] = isOpen
    ? ['Dag 1', 'Dag 2', 'Dag 3', 'Dag 4', 'Dag 5', 'Dag 6'].map((label, dayIndex) => ({
        label,
        values: Object.fromEntries(entries.map((entry, entryIndex) => {
          const finish = entry.totalPoints
          const curve = Math.max(0, Math.round((finish / 6) * (dayIndex + 1) - entryIndex * 0.35 + (dayIndex % 2)))
          return [entry.id, Math.min(finish, curve)]
        })),
      }))
    : makeFlatGraph(entries)

  return {
    isOpen,
    isPreview: true,
    lastUpdated: new Date().toISOString(),
    maxPoints: LEADERBOARD_MAX_POINTS,
    entries,
    graph,
    graphPlaceholder: !isOpen,
  }
}

function buildGraph(
  submissions: SubmissionRow[],
  matches: MatchRow[],
  groupPicks: GroupPickRow[]
): LeaderboardGraphPoint[] {
  const finishedMatches = matches
    .filter(match => match.phase === 'group' && match.status === 'finished' && match.result)
    .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())

  if (finishedMatches.length === 0) {
    return makeFlatGraph(submissions.map(submission => ({ id: submission.id })))
  }

  const matchById = new Map(finishedMatches.map(match => [match.id, match]))
  const picksBySubmission = new Map<string, GroupPickRow[]>()
  for (const pick of groupPicks) {
    const bucket = picksBySubmission.get(pick.submission_id) ?? []
    bucket.push(pick)
    picksBySubmission.set(pick.submission_id, bucket)
  }

  const dayKeys = Array.from(new Set(finishedMatches.map(match => match.kickoff.slice(0, 10))))

  return dayKeys.map((dayKey, index) => {
    const until = new Date(`${dayKey}T23:59:59.999Z`).getTime()

    return {
      label: `Dag ${index + 1}`,
      values: Object.fromEntries(submissions.map(submission => {
        const score = (picksBySubmission.get(submission.id) ?? []).reduce((total, pick) => {
          const match = matchById.get(pick.match_id)
          if (!match || new Date(match.kickoff).getTime() > until) return total
          return match.result === pick.pick ? total + 1 : total
        }, 0)

        return [submission.id, score]
      })),
    }
  })
}

export async function getDashboardLeaderboard(
  service: SupabaseClient,
  currentUserId: string | null,
  now = new Date(),
  preview: 'pre' | 'mid' | null = null
): Promise<DashboardLeaderboardData> {
  if (preview) {
    const previewNow = preview === 'mid' ? new Date('2026-06-21T12:00:00Z') : new Date('2026-06-01T12:00:00Z')
    return previewLeaderboard(currentUserId, previewNow)
  }

  const isOpen = now >= TOURNAMENT_START

  const [
    { data: submissions },
    { data: matches },
    { data: groupPicks },
  ] = await Promise.all([
    service
      .from('vmt_submissions')
      .select('id, user_id, name, confirmed, total_points, submitted_at')
      .eq('confirmed', true)
      .order('submitted_at', { ascending: true }),
    service
      .from('vmt_matches')
      .select('id, kickoff, result, status, phase')
      .order('kickoff', { ascending: true }),
    service
      .from('vmt_group_picks')
      .select('submission_id, match_id, pick'),
  ])

  const confirmed = (submissions ?? []) as SubmissionRow[]
  const matchRows = (matches ?? []) as MatchRow[]
  const pickRows = (groupPicks ?? []) as GroupPickRow[]
  const finishedGroupMatches = matchRows.filter(match => match.phase === 'group' && match.status === 'finished' && match.result)
  const possibleTips = Math.min(finishedGroupMatches.length, 36)
  const matchById = new Map(finishedGroupMatches.map(match => [match.id, match]))

  const correctBySubmission = new Map<string, number>()
  for (const pick of pickRows) {
    const match = matchById.get(pick.match_id)
    if (match?.result === pick.pick) {
      correctBySubmission.set(pick.submission_id, (correctBySubmission.get(pick.submission_id) ?? 0) + 1)
    }
  }

  const entries = rankEntries(
    confirmed.map(submission => {
      const totalPoints = isOpen ? asNumber(submission.total_points) : 0

      return {
        id: submission.id,
        userId: submission.user_id,
        name: submission.name,
        totalPoints,
        rankMovement: 0,
        correctTips: isOpen ? (correctBySubmission.get(submission.id) ?? 0) : 0,
        possibleTips: isOpen ? possibleTips : 0,
        isCurrentUser: Boolean(currentUserId && submission.user_id === currentUserId),
        breakdown: phaseBreakdown(totalPoints),
      }
    })
  )

  const graph = isOpen ? buildGraph(confirmed, matchRows, pickRows) : makeFlatGraph(entries)

  return {
    isOpen,
    isPreview: false,
    lastUpdated: new Date().toISOString(),
    maxPoints: LEADERBOARD_MAX_POINTS,
    entries,
    graph,
    graphPlaceholder: !isOpen || graph.length === 1,
  }
}
