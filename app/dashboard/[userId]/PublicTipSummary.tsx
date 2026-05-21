const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

interface GroupData {
  tableOrder: string[]
  thirdPlaceSelected: boolean
  groupScorer: string | null
}

interface BracketRound {
  label: string
  picks: string[]
}

interface Props {
  groups: Record<string, GroupData>
  bracketRounds: BracketRound[]
  tournamentScorer: string | null
}

export default function PublicTipSummary({ groups, bracketRounds, tournamentScorer }: Props) {
  return (
    <div className="space-y-6">
      {/* Group table predictions */}
      <div className="border border-white/10">
        <div className="border-b border-white/10 bg-navy-900 px-4 py-2.5">
          <div className="label">Grupptabeller</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-white/5">
          {ALL_GROUPS.map(g => {
            const gd = groups[g]
            return (
              <div key={g} className="px-3 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="font-display font-black text-xs uppercase tracking-widest text-white/60">Grupp {g}</span>
                  {gd?.thirdPlaceSelected && (
                    <span className="text-[9px] font-display font-black uppercase tracking-wider border border-swe-yellow/30 text-swe-yellow/70 px-1">3:a vidare</span>
                  )}
                </div>
                <ol className="space-y-0.5">
                  {(gd?.tableOrder ?? []).map((team, i) => (
                    <li key={team} className="flex items-center gap-1.5 text-xs">
                      <span className="font-mono text-white/20 w-3">{i + 1}.</span>
                      <span className={i < 2 ? 'text-white/80' : 'text-white/35'}>{team}</span>
                    </li>
                  ))}
                </ol>
                {gd?.groupScorer && (
                  <p className="mt-1.5 text-[10px] text-pitch-400/80">⚽ {gd.groupScorer}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bracket rounds */}
      <div className="border border-white/10">
        <div className="border-b border-white/10 bg-navy-900 px-4 py-2.5">
          <div className="label">Slutspel</div>
        </div>
        <div className="divide-y divide-white/5">
          {bracketRounds.map(round => (
            <div key={round.label} className="px-4 py-3">
              <div className="label text-[9px] mb-2">{round.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {round.picks.map((team, i) => (
                  <span
                    key={i}
                    className="text-xs font-display font-black uppercase tracking-wide border border-white/10 px-2 py-0.5 text-white/70"
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tournament scorer */}
      {tournamentScorer && (
        <div className="border border-white/10 px-4 py-3 flex items-center gap-3">
          <div className="label text-[9px]">Skyttekung VM</div>
          <span className="text-sm text-pitch-400 font-medium">{tournamentScorer}</span>
        </div>
      )}
    </div>
  )
}
