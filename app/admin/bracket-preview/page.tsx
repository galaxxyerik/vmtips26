import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { SlutspelSection, type BracketPick } from '../AdminSubmissionRow'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

const previewBracketPicks: BracketPick[] = [
  { match_number: 73, pick_team: 'Mexico', round: 'r32' },
  { match_number: 74, pick_team: 'Czechia', round: 'r32' },
  { match_number: 75, pick_team: 'South Africa', round: 'r32' },
  { match_number: 76, pick_team: 'Korea Republic', round: 'r32' },
  { match_number: 77, pick_team: 'Germany', round: 'r32' },
  { match_number: 78, pick_team: 'Norway', round: 'r32' },
  { match_number: 79, pick_team: 'Netherlands', round: 'r32' },
  { match_number: 80, pick_team: 'Mexico', round: 'r32' },
  { match_number: 81, pick_team: 'Brazil', round: 'r32' },
  { match_number: 82, pick_team: 'England', round: 'r32' },
  { match_number: 83, pick_team: 'France', round: 'r32' },
  { match_number: 84, pick_team: 'Turkiye', round: 'r32' },
  { match_number: 85, pick_team: 'Belgium', round: 'r32' },
  { match_number: 86, pick_team: 'Croatia', round: 'r32' },
  { match_number: 87, pick_team: 'Portugal', round: 'r32' },
  { match_number: 88, pick_team: 'Argentina', round: 'r32' },
  { match_number: 89, pick_team: 'Germany', round: 'r16' },
  { match_number: 90, pick_team: 'Brazil', round: 'r16' },
  { match_number: 91, pick_team: 'Norway', round: 'r16' },
  { match_number: 92, pick_team: 'England', round: 'r16' },
  { match_number: 93, pick_team: 'Belgium', round: 'r16' },
  { match_number: 94, pick_team: 'Spain', round: 'r16' },
  { match_number: 95, pick_team: 'Argentina', round: 'r16' },
  { match_number: 96, pick_team: 'Portugal', round: 'r16' },
  { match_number: 97, pick_team: 'Germany', round: 'qf' },
  { match_number: 98, pick_team: 'England', round: 'qf' },
  { match_number: 99, pick_team: 'Spain', round: 'qf' },
  { match_number: 100, pick_team: 'Argentina', round: 'qf' },
  { match_number: 101, pick_team: 'Germany', round: 'sf' },
  { match_number: 102, pick_team: 'Spain', round: 'sf' },
  { match_number: 103, pick_team: 'England', round: 'bronze' },
  { match_number: 104, pick_team: 'Spain', round: 'final' },
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
              Den ska visa 16, 8, 4, 2 och sedan finalister plus vinnare.
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
            ['Sextondelsfinal', '16 lag vidare'],
            ['Åttondelsfinal', '8 lag vidare'],
            ['Kvartsfinal', '4 lag vidare'],
            ['Semifinal', '2 lag vidare'],
            ['Final', '2 finalister + 1 vinnare'],
          ].map(([label, value]) => (
            <div key={label} className="border border-white/10 bg-navy-900/40 px-3 py-3">
              <div className="label mb-1">{label}</div>
              <div className="text-white/75">{value}</div>
            </div>
          ))}
        </div>

        <div className="border border-white/10 bg-navy-950/40">
          <SlutspelSection bracketPicks={previewBracketPicks} />
        </div>
      </main>
    </div>
  )
}
