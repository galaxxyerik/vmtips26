import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { SlutspelSection, type BracketPick, type GroupData } from '../AdminSubmissionRow'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

const previewGroups: Record<string, GroupData> = {
  A: { matches: [], tableOrder: ['A1', 'A2', 'A3', 'A4'], thirdPlaceSelected: false, groupScorer: null },
  B: { matches: [], tableOrder: ['B1', 'B2', 'B3', 'B4'], thirdPlaceSelected: false, groupScorer: null },
  C: { matches: [], tableOrder: ['C1', 'C2', 'C3', 'C4'], thirdPlaceSelected: false, groupScorer: null },
  D: { matches: [], tableOrder: ['D1', 'D2', 'D3', 'D4'], thirdPlaceSelected: false, groupScorer: null },
  E: { matches: [], tableOrder: ['E1', 'E2', 'E3', 'E4'], thirdPlaceSelected: true, groupScorer: null },
  F: { matches: [], tableOrder: ['F1', 'F2', 'F3', 'F4'], thirdPlaceSelected: true, groupScorer: null },
  G: { matches: [], tableOrder: ['G1', 'G2', 'G3', 'G4'], thirdPlaceSelected: true, groupScorer: null },
  H: { matches: [], tableOrder: ['H1', 'H2', 'H3', 'H4'], thirdPlaceSelected: true, groupScorer: null },
  I: { matches: [], tableOrder: ['I1', 'I2', 'I3', 'I4'], thirdPlaceSelected: true, groupScorer: null },
  J: { matches: [], tableOrder: ['J1', 'J2', 'J3', 'J4'], thirdPlaceSelected: true, groupScorer: null },
  K: { matches: [], tableOrder: ['K1', 'K2', 'K3', 'K4'], thirdPlaceSelected: true, groupScorer: null },
  L: { matches: [], tableOrder: ['L1', 'L2', 'L3', 'L4'], thirdPlaceSelected: true, groupScorer: null },
}

const previewBracketPicks: BracketPick[] = [
  { match_number: 73, pick_team: 'A2', round: 'r32' },
  { match_number: 74, pick_team: 'E1', round: 'r32' },
  { match_number: 75, pick_team: 'F1', round: 'r32' },
  { match_number: 76, pick_team: 'C1', round: 'r32' },
  { match_number: 77, pick_team: 'I1', round: 'r32' },
  { match_number: 78, pick_team: 'E2', round: 'r32' },
  { match_number: 79, pick_team: 'A1', round: 'r32' },
  { match_number: 80, pick_team: 'L1', round: 'r32' },
  { match_number: 81, pick_team: 'D1', round: 'r32' },
  { match_number: 82, pick_team: 'G1', round: 'r32' },
  { match_number: 83, pick_team: 'K2', round: 'r32' },
  { match_number: 84, pick_team: 'H1', round: 'r32' },
  { match_number: 85, pick_team: 'B1', round: 'r32' },
  { match_number: 86, pick_team: 'J1', round: 'r32' },
  { match_number: 87, pick_team: 'K1', round: 'r32' },
  { match_number: 88, pick_team: 'G2', round: 'r32' },
  { match_number: 89, pick_team: 'E1', round: 'r16' },
  { match_number: 90, pick_team: 'C1', round: 'r16' },
  { match_number: 91, pick_team: 'I1', round: 'r16' },
  { match_number: 92, pick_team: 'A1', round: 'r16' },
  { match_number: 93, pick_team: 'D1', round: 'r16' },
  { match_number: 94, pick_team: 'H1', round: 'r16' },
  { match_number: 95, pick_team: 'B1', round: 'r16' },
  { match_number: 96, pick_team: 'K1', round: 'r16' },
  { match_number: 97, pick_team: 'E1', round: 'qf' },
  { match_number: 98, pick_team: 'A1', round: 'qf' },
  { match_number: 99, pick_team: 'H1', round: 'qf' },
  { match_number: 100, pick_team: 'K1', round: 'qf' },
  { match_number: 101, pick_team: 'E1', round: 'sf' },
  { match_number: 102, pick_team: 'H1', round: 'sf' },
  { match_number: 103, pick_team: 'A1', round: 'bronze' },
  { match_number: 104, pick_team: 'H1', round: 'final' },
]

export default async function AdminBracketPreviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user.email} />

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label mb-1">Admin</div>
            <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">
              Bracket-preview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              Den här testsidan visar en komplett mockad slutspelstrappa i samma komponent som admin-vyn använder.
              Den ska visa faktiska matchpar i varje runda och markera vilken sida som vinner matchen.
            </p>
          </div>
          <Link
            href="/admin"
            className="border border-white/15 px-3 py-2 text-xs font-display font-black uppercase tracking-[0.1em] text-white/60 transition-colors hover:border-white/30 hover:text-white"
          >
            Till admin
          </Link>
        </div>

        <div className="grid gap-3 text-xs text-white/55 sm:grid-cols-5">
          {[
            ['Sextondelsfinal', '32 lag · 16 matcher'],
            ['Åttondelsfinal', '16 lag · 8 matcher'],
            ['Kvartsfinal', '8 lag · 4 matcher'],
            ['Semifinal', '4 lag · 2 matcher'],
            ['Final', '2 finalister + 1 vinnare'],
          ].map(([label, value]) => (
            <div key={label} className="border border-white/10 bg-navy-900/40 px-3 py-3">
              <div className="label mb-1">{label}</div>
              <div className="text-white/75">{value}</div>
            </div>
          ))}
        </div>

        <div className="border border-white/10 bg-navy-950/40">
          <SlutspelSection bracketPicks={previewBracketPicks} groups={previewGroups} />
        </div>
      </main>
    </div>
  )
}
