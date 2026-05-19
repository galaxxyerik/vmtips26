'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveDraft } from '@/lib/onboarding-storage'
import { canEditPicks } from '@/lib/deadlines'
import { SlutspelSection, type BracketPick, type GroupData } from '@/app/admin/AdminSubmissionRow'
import type { OnboardingDraft } from '@/lib/types'

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

interface PicksPayload {
  draft: OnboardingDraft
  groups: Record<string, GroupData>
  bracketPicks: BracketPick[]
  tournamentScorer: string | null
}

export default function MyTipDetails() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState('A')
  const [data, setData] = useState<PicksPayload | null>(null)
  const editable = canEditPicks()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/me/submission-picks')
        if (!res.ok) throw new Error('Kunde inte hämta ditt tips.')
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Kunde inte hämta ditt tips.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleUpdate() {
    if (!data || !editable) return
    setUpdating(true)
    saveDraft({ ...data.draft, step: 'group-stage' })
    router.push('/onboarding/group-stage')
  }

  if (loading) {
    return <div className="border border-white/10 px-4 py-8 text-center text-white/30 text-sm">Laddar ditt tips…</div>
  }

  if (error || !data) {
    return <div className="border border-loss-500/30 bg-loss-900/20 px-4 py-4 text-sm text-loss-500">{error ?? 'Kunde inte hämta ditt tips.'}</div>
  }

  const group = data.groups[activeGroup]

  return (
    <div className="space-y-6">
      <div className="border border-white/10">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-navy-900 px-4 py-3">
          <div>
            <div className="label">Dina picks</div>
            <div className="text-xs text-white/35">
              {editable ? 'Du kan fortfarande justera allt fram till 11 juni kl 17:00.' : 'Deadline har passerat och tipset är låst.'}
            </div>
          </div>
          {editable && (
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="btn-primary h-9 shrink-0 px-4 text-sm disabled:opacity-40"
            >
              {updating ? 'Öppnar...' : 'Uppdatera mitt tips'}
            </button>
          )}
        </div>

        <div className="px-4 pt-4 pb-2">
          <div className="label text-swe-yellow/60 mb-2">Sektion 1 — Gruppspel</div>
          <div className="flex flex-wrap gap-1">
            {ALL_GROUPS.map(label => (
              <button
                key={label}
                onClick={() => setActiveGroup(label)}
                className={`px-2 py-1 text-xs font-display font-black uppercase border transition-colors ${
                  activeGroup === label
                    ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
                    : 'border-white/10 text-white/35 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {group && (
          <div className="px-4 pb-4 space-y-3">
            <div className="border border-white/10">
              <div className="grid grid-cols-[1fr_auto_1fr] text-[9px] font-display font-black uppercase tracking-widest text-white/25 px-3 h-7 items-center border-b border-white/5 bg-navy-900/60">
                <span>Hemmalag</span>
                <span className="text-center px-4">Tips</span>
                <span className="text-right">Bortalag</span>
              </div>
              <div className="divide-y divide-white/5">
                {group.matches.map(match => (
                  <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center px-3 py-2 gap-2">
                    <span className={`text-sm font-medium ${match.pick === '1' ? 'text-swe-yellow' : 'text-white/70'}`}>{match.home_team}</span>
                    <div className="flex gap-1 justify-center px-2">
                      {(['1', 'X', '2'] as const).map(value => (
                        <span
                          key={value}
                          className={`w-6 h-6 flex items-center justify-center text-xs font-display font-black border ${
                            match.pick === value ? 'bg-swe-yellow/10 border-swe-yellow text-swe-yellow' : 'border-white/10 text-white/20'
                          }`}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                    <span className={`text-sm font-medium text-right ${match.pick === '2' ? 'text-swe-yellow' : 'text-white/70'}`}>{match.away_team}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="label text-[9px] self-center">Tabellordning</span>
              {group.tableOrder.map((team, index) => (
                <span key={team} className="text-white/55">
                  <span className="text-white/25 font-mono mr-1">{index + 1}.</span>
                  {team}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <span>
                <span className="label text-[9px] mr-1.5">Trea vidare</span>
                <span className={group.thirdPlaceSelected ? 'text-pitch-400' : 'text-white/30'}>
                  {group.thirdPlaceSelected ? 'Ja' : 'Nej'}
                </span>
              </span>
              <span>
                <span className="label text-[9px] mr-1.5">Skyttekung</span>
                <span className="text-white/70">{group.groupScorer ?? '—'}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border border-white/10">
        <SlutspelSection bracketPicks={data.bracketPicks} groups={data.groups} />
      </div>

      <div className="border border-white/10 px-4 py-4">
        <div className="label text-swe-yellow/60 mb-2">Sektion 3 — Övrigt</div>
        <div className="text-sm text-white/70">
          Skyttekung i VM: <span className="text-pitch-400">{data.tournamentScorer ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}
