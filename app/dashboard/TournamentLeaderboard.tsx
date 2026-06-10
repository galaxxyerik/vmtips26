'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardLeaderboardData, LeaderboardEntry } from '@/lib/leaderboard'

const LINE_COLORS = [
  '#FFC000',
  '#60a5fa',
  '#f87171',
  '#4ade80',
  '#c084fc',
  '#fb923c',
  '#38bdf8',
  '#f472b6',
  '#a3e635',
  '#facc15',
  '#2dd4bf',
  '#cbd5e1',
]

type TournamentLeaderboardProps = {
  initialData: DashboardLeaderboardData
  previewMode?: 'pre' | 'mid' | null
}

type ChartPoint = {
  label: string
  [key: string]: string | number
}

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function movementLabel(value: number) {
  if (value > 0) return { sign: '▲', text: String(value), className: 'text-[#22c55e]' }
  if (value < 0) return { sign: '▼', text: String(Math.abs(value)), className: 'text-[#ef4444]' }
  return { sign: '—', text: '', className: 'text-white/30' }
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="pl-3 border-l-2 border-swe-yellow mb-5">
      <h2 className="font-display font-black uppercase text-white text-xl tracking-wide">
        {children}
      </h2>
    </div>
  )
}

function LeaderboardRow({ entry, isOpen }: { entry: LeaderboardEntry; isOpen: boolean }) {
  const movement = movementLabel(entry.rankMovement)
  const rowTone = isOpen && entry.rank === 1
    ? 'border-l-2 border-l-[#FFC000] bg-[rgba(255,192,0,0.04)]'
    : entry.isCurrentUser
      ? 'border-l-2 border-l-white/30 bg-white/[0.03]'
      : 'border-l-2 border-l-transparent'

  return (
    <div
      className={`grid min-h-14 grid-cols-[52px_minmax(0,1fr)_78px] items-center border-t border-white/8 px-3 sm:px-4 ${isOpen ? 'sm:grid-cols-[72px_minmax(0,1fr)_104px_72px_82px]' : 'sm:grid-cols-[72px_minmax(0,1fr)_104px]'} ${isOpen && entry.rank === 4 ? 'border-t-2 border-t-white/15' : ''} ${rowTone}`}
    >
      <div className={`font-mono text-[28px] font-bold leading-none tnum ${isOpen && entry.rank === 1 ? 'text-[#FFC000]' : 'text-white/70'}`}>
        {entry.rank}
      </div>

      <div className="min-w-0">
        <div className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide text-white">
          {entry.name}
        </div>
        {entry.isCurrentUser && (
          <div className="mt-1 font-sans text-[10px] uppercase tracking-[0.16em] text-swe-yellow">
            Du
          </div>
        )}
      </div>

      <div className={`text-right font-mono text-2xl font-bold leading-none tnum ${isOpen ? 'text-white' : 'text-white/30'}`}>
        {entry.totalPoints}
      </div>

      {isOpen && (
        <div className={`text-right font-mono text-sm font-bold tnum ${movement.className}`} aria-label="Rankrörelse">
          {movement.sign}{movement.text && <span className="ml-1">{movement.text}</span>}
        </div>
      )}

      {isOpen && (
        <div className="hidden text-right font-mono text-xs text-white/50 tnum sm:block">
          {entry.correctTips}/{entry.possibleTips || 36}
        </div>
      )}
    </div>
  )
}

function LeaderboardTable({ data }: { data: DashboardLeaderboardData }) {
  return (
    <div className="-mx-4 lg:-mx-8">
      {!data.isOpen && (
        <div className="mb-6 text-center font-display text-lg font-black uppercase tracking-wide text-swe-yellow">
          TURNERINGEN BÖRJAR 11 JUNI · POÄNGEN BÖRJAR TICKA IN
        </div>
      )}

      <div className={`grid px-3 pb-2 text-[9px] font-display font-black uppercase tracking-[0.18em] text-white/35 sm:px-4 ${data.isOpen ? 'grid-cols-[52px_minmax(0,1fr)_78px_52px] sm:grid-cols-[72px_minmax(0,1fr)_104px_72px_82px]' : 'grid-cols-[52px_minmax(0,1fr)_78px] sm:grid-cols-[72px_minmax(0,1fr)_104px]'}`}>
        <div>#</div>
        <div>Namn</div>
        <div className="text-right">Poäng</div>
        {data.isOpen && <div className="text-right">Rörelse</div>}
        {data.isOpen && <div className="hidden text-right sm:block">Rätt tips</div>}
      </div>

      <div>
        {data.entries.length === 0 ? (
          <div className="border-t border-white/8 py-14 text-center font-sans text-sm text-white/35">
            Inga bekräftade deltagare ännu.
          </div>
        ) : (
          data.entries.map(entry => <LeaderboardRow key={entry.id} entry={entry} isOpen={data.isOpen} />)
        )}
      </div>

      <div className="mt-3 px-3 font-sans text-[11px] text-white/30 sm:px-4">
        Senast uppdaterad: {formatUpdated(data.lastUpdated)} · Max {data.maxPoints.total}p
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const sorted = [...payload].sort((a, b) => b.value - a.value)
  const visible = sorted.slice(0, 10)
  const overflow = sorted.length - visible.length

  return (
    <div className="border border-white/10 bg-navy-950 px-3 py-2">
      <div className="mb-1 font-display text-sm font-black uppercase tracking-wide text-swe-yellow">
        {label}
      </div>
      <div className="space-y-1">
        {visible.map((item: any) => (
          <div key={item.dataKey} className="flex min-w-32 items-center justify-between gap-4 font-sans text-xs">
            <span style={{ color: item.color }}>{item.name}</span>
            <span className="font-mono text-white tnum">{item.value}p</span>
          </div>
        ))}
        {overflow > 0 && (
          <div className="pt-1 font-sans text-xs text-white/35">+{overflow} till</div>
        )}
      </div>
    </div>
  )
}

function PointsGraph({ data }: { data: DashboardLeaderboardData }) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })
  const chartData = useMemo<ChartPoint[]>(() => {
    return data.graph.map(point => ({
      label: point.label,
      ...Object.fromEntries(data.entries.map(entry => [entry.id, point.values[entry.id] ?? 0])),
    }))
  }, [data.entries, data.graph])

  const currentEntry = data.entries.find(entry => entry.isCurrentUser)

  useEffect(() => {
    const node = chartRef.current
    if (!node) return

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      setChartSize({
        width: Math.max(0, Math.round(rect.width)),
        height: Math.max(0, Math.round(rect.height)),
      })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <SectionHeader>Poängutveckling</SectionHeader>
      <div ref={chartRef} className="relative h-[200px] min-w-0 sm:h-[260px]">
        {data.graphPlaceholder && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-center font-sans text-sm text-white/40">
            Grafen fylls i match för match
          </div>
        )}
        {chartSize.width > 0 && chartSize.height > 0 && (
          <LineChart
            width={chartSize.width}
            height={chartSize.height}
            data={chartData}
            margin={{ top: 16, right: 12, bottom: 8, left: 0 }}
          >
            <XAxis
              dataKey="label"
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,192,0,0.24)' }} />
            {data.entries.map((entry, index) => (
              <Line
                key={entry.id}
                type="monotone"
                dataKey={entry.id}
                name={entry.name}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={entry.isCurrentUser ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: entry.isCurrentUser ? 4 : 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        )}
        {currentEntry && !data.graphPlaceholder && (
          <div className="absolute right-0 top-3 font-display text-xs font-black uppercase tracking-wide text-swe-yellow">
            {currentEntry.name}
          </div>
        )}
      </div>
    </div>
  )
}

function RoundBreakdown({ data }: { data: DashboardLeaderboardData }) {
  const [isOpen, setIsOpen] = useState(false)
  const currentEntry = data.entries.find(entry => entry.isCurrentUser)

  useEffect(() => {
    setIsOpen(window.matchMedia('(min-width: 640px)').matches)
  }, [])

  if (!currentEntry) return null

  const rows = [
    { label: 'Gruppspel', points: currentEntry.breakdown.group, max: data.maxPoints.group },
    { label: 'Slutspel', points: currentEntry.breakdown.knockout, max: data.maxPoints.knockout },
    { label: 'Bonus', points: currentEntry.breakdown.bonus, max: data.maxPoints.bonus },
  ]

  return (
    <details className="group" open={isOpen} onToggle={event => setIsOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer list-none border-t border-white/10 py-4 font-display text-lg font-black uppercase tracking-wide text-white marker:hidden">
        Din poängfördelning
        <span className="float-right font-mono text-sm text-white/30 group-open:hidden">+</span>
        <span className="float-right hidden font-mono text-sm text-white/30 group-open:inline">−</span>
      </summary>
      <div className="border-t border-white/10">
        {rows.map(row => (
          <div key={row.label} className="flex min-h-12 items-center justify-between border-b border-white/8 py-3 last:border-b-0">
            <span className="font-display text-lg font-black uppercase tracking-wide text-white/85">
              {row.label}
            </span>
            <span className="font-mono text-sm text-white/40 tnum">
              <span className="text-swe-yellow">{row.points}p</span> av {row.max}p
            </span>
          </div>
        ))}
      </div>
    </details>
  )
}

export default function TournamentLeaderboard({ initialData, previewMode = null }: TournamentLeaderboardProps) {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    if (!data.isOpen) return

    const controller = new AbortController()
    const load = async () => {
      const previewParam = previewMode ? `?preview=${previewMode}` : ''
      const response = await fetch(`/api/dashboard/leaderboard${previewParam}`, {
        signal: controller.signal,
      })
      if (response.ok) {
        setData(await response.json())
      }
    }

    const interval = window.setInterval(() => {
      load().catch(() => {})
    }, 60_000)

    return () => {
      controller.abort()
      window.clearInterval(interval)
    }
  }, [data.isOpen, previewMode])

  return (
    <section className="space-y-10">
      <LeaderboardTable data={data} />
      <PointsGraph data={data} />
      <RoundBreakdown data={data} />
    </section>
  )
}
