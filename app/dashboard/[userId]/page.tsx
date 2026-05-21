import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { canEditPicks } from '@/lib/deadlines'
import MyTipDetails from './MyTipDetails'
import PublicTipSummary from './PublicTipSummary'

export const dynamic = 'force-dynamic'

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const ROUND_LABELS: Record<string, string> = {
  r32:    'Sextondelsfinal',
  r16:    'Åttondelsfinaler',
  qf:     'Kvartsfinaler',
  sf:     'Semifinaler',
  bronze: 'Bronsmatch',
  final:  'Final',
}

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: submission } = await supabase
    .from('vmt_submissions')
    .select('id, name, total_points, confirmed, submitted_at, user_id')
    .eq('id', userId)
    .single()

  if (!submission) notFound()

  const isOwn = !!user && user.id === submission.user_id
  const editable = isOwn && canEditPicks()

  // For confirmed non-own submissions, load picks for public display
  let publicData: React.ComponentProps<typeof PublicTipSummary> | null = null
  if (!isOwn && submission.confirmed) {
    const service = createServiceClient()
    const [
      { data: tableOrder },
      { data: thirdPlace },
      { data: groupScorers },
      { data: bracketPicks },
      { data: tournamentScorer },
    ] = await Promise.all([
      service.from('vmt_group_table_picks').select('group_label, position, team').eq('submission_id', submission.id).order('position'),
      service.from('vmt_third_place_picks').select('group_label, selected').eq('submission_id', submission.id),
      service.from('vmt_group_scorer_picks').select('group_label, player_name').eq('submission_id', submission.id),
      service.from('vmt_bracket_picks').select('match_number, pick_team, round').eq('submission_id', submission.id).order('match_number'),
      service.from('vmt_tournament_scorer_pick').select('player_name').eq('submission_id', submission.id).maybeSingle(),
    ])

    const groups: Record<string, { tableOrder: string[]; thirdPlaceSelected: boolean; groupScorer: string | null }> = {}
    for (const g of ALL_GROUPS) {
      const order = (tableOrder ?? [])
        .filter(r => r.group_label === g)
        .sort((a, b) => a.position - b.position)
        .map(r => r.team)
      const thirdSelected = (thirdPlace ?? []).find(r => r.group_label === g)?.selected ?? false
      const scorer = (groupScorers ?? []).find(r => r.group_label === g)?.player_name ?? null
      groups[g] = { tableOrder: order, thirdPlaceSelected: thirdSelected, groupScorer: scorer }
    }

    const roundOrder = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final']
    const bracketRounds = roundOrder
      .map(round => {
        const picks = (bracketPicks ?? [])
          .filter(r => r.round === round)
          .map(r => r.pick_team)
        return { label: ROUND_LABELS[round] ?? round, picks }
      })
      .filter(r => r.picks.length > 0)

    publicData = {
      groups,
      bracketRounds,
      tournamentScorer: tournamentScorer?.player_name ?? null,
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <div className="label mb-1">Deltagare</div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide text-white">
            {submission.name}
            {isOwn && <span className="ml-3 text-sm text-swe-yellow font-normal normal-case">(ditt tips)</span>}
          </h1>
          {submission.confirmed ? (
            <div className="font-display font-black text-4xl text-swe-yellow mt-2 tnum">
              {submission.total_points ?? 0}
              <span className="text-base text-swe-yellow/50 ml-1 font-normal">poäng</span>
            </div>
          ) : (
            <p className="text-white/40 text-sm mt-2">⏳ Väntar på betalningsbekräftelse</p>
          )}
          {editable && (
            <p className="text-white/35 text-sm mt-2">
              Ditt tips är fortfarande öppet för ändringar fram till 11 juni kl 17:00.
            </p>
          )}
        </div>

        {isOwn ? (
          <MyTipDetails />
        ) : !submission.confirmed ? (
          <div className="border border-white/10 px-4 py-8 text-center text-white/30 text-sm">
            Tips och poäng visas när betalningen är bekräftad.
          </div>
        ) : publicData ? (
          <PublicTipSummary {...publicData} />
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
