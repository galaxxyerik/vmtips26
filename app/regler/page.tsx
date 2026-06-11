import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import SwishSection from './SwishSection'

export const dynamic = 'force-dynamic'

export default async function ReglerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      {/* Hero — AT&T Stadium, Dallas */}
      <div className="relative h-[40vh] min-h-[220px] overflow-hidden">
        <Image
          src="/images/att-stadium.jpg"
          alt="AT&T Stadium i Dallas, Texas — VM-arena 2026"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-navy-950/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-16 pb-10">
          <div className="label text-swe-yellow/60 mb-2">VM-TIPS 26</div>
          <h1 className="font-display font-black text-5xl sm:text-7xl uppercase tracking-tight text-white leading-none">Regler &amp; Poängsystem</h1>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 lg:px-8 py-12">
        <div className="space-y-14">

          {/* ── DEADLINE CALLOUT ── */}
          <div className="border-l-4 border-swe-yellow pl-5 py-1">
            <div className="font-display font-black uppercase text-swe-yellow leading-none" style={{ fontSize: 'clamp(32px, 6vw, 56px)' }}>
              DEADLINE
            </div>
            <div className="font-mono font-bold text-white tnum mt-1" style={{ fontSize: 'clamp(18px, 3vw, 28px)' }}>
              11 JUNI 2026 · KL 21:30
            </div>
            <p className="text-white/60 text-sm mt-2">Tips inlämnade efter detta datum gäller inte.</p>
          </div>

          {/* ── TURNERINGSFORMAT ── */}
          <Section title="Turneringsformat">
            <p className="text-white/60 leading-relaxed mb-4">
              FIFA VM 2026 spelas i USA, Kanada och Mexiko med <strong className="text-white">48 lag</strong> fördelade på <strong className="text-white">12 grupper</strong>.
            </p>
            <div className="space-y-4">
              <div className="border-l-2 border-swe-yellow/40 pl-4">
                <div className="font-display font-black text-sm uppercase tracking-wider text-white/70 mb-1">Gruppspel</div>
                <p className="text-white/50 text-sm leading-relaxed">
                  Varje grupp har 4 lag som möter varandra en gång (6 matcher per grupp). Du tippar utfallet:
                  <span className="text-white/75 font-medium"> 1 = hemmalaget, X = oavgjort, 2 = bortalaget.</span>
                  {' '}De 2 bästa i varje grupp går vidare. De 8 bästa tredjeplacerade går också vidare — du väljer vilka.
                </p>
              </div>
              <div className="border-l-2 border-swe-yellow/40 pl-4">
                <div className="font-display font-black text-sm uppercase tracking-wider text-white/70 mb-1">Slutspel</div>
                <p className="text-white/50 text-sm leading-relaxed">
                  32 lag i rent utslagsspel från sextondelsfinal till final. Du tippar vinnaren av varje match. Det spelas även bronsmatch.
                </p>
              </div>
            </div>
          </Section>

          {/* ── DELTAGANDE & BETALNING ── */}
          <Section title="Deltagande &amp; Betalning">
            <p className="text-white/60 leading-relaxed mb-5">
              Insatsen är <strong className="text-white">100 kr per person</strong>.
              Du är officiellt med när Erik bekräftat din betalning.
            </p>
            <SwishSection />
          </Section>

          {/* ── POÄNGSYSTEM — GRUPPSPEL ── */}
          <Section title="Gruppspel">
            <PointsGroup
              rows={[
                { pts: '1', label: 'Rätt matchutfall', desc: '1/X/2 korrekt · 72 matcher totalt · max 72 p' },
                { pts: '2', label: 'Rätt lag, exakt rätt plats i grupptabell', desc: 'Exakt position 1–4 i gruppen' },
                { pts: '1', label: 'Rätt lag, en plats fel i grupptabell', desc: '12 grupper × 4 lag · max 96 p totalt' },
                { pts: '1', label: 'Rätt trea vidare', desc: '8 av 12 tredjeplacerade går vidare · max 8 p' },
                { pts: '3', label: 'Rätt gruppskyttekung', desc: '12 grupper × 3 p · max 36 p' },
              ]}
            />
          </Section>

          {/* ── POÄNGSYSTEM — SLUTSPEL ── */}
          <Section title="Slutspel">
            <PointsGroup
              rows={[
                { pts: '2 / 1', label: 'Sextondelsfinal', desc: 'Rätt väg = 2 p · Annan väg = 1 p' },
                { pts: '3 / 1,5', label: 'Åttondelsfinaler', desc: 'Rätt väg = 3 p · Annan väg = 1,5 p' },
                { pts: '4 / 2', label: 'Kvartsfinaler', desc: 'Rätt väg = 4 p · Annan väg = 2 p' },
                { pts: '5 / 2,5', label: 'Semifinaler', desc: 'Rätt väg = 5 p · Annan väg = 2,5 p' },
                { pts: '3 / 1,5', label: 'Bronsmatch', desc: 'Rätt väg = 3 p · Annan väg = 1,5 p' },
                { pts: '6 / 3', label: 'Final — rätt mästare', desc: 'Rätt väg = 6 p · Annan väg = 3 p' },
              ]}
            />

            {/* Annan väg explainer */}
            <div className="mt-8">
              <div className="label mb-4">Vad betyder &ldquo;annan väg&rdquo;?</div>
              <AnnanVagDiagram />
              <div className="mt-4 border-l-2 border-white/15 pl-4">
                <p className="text-white/50 text-sm leading-relaxed">
                  <span className="text-white/75 font-medium">Konkret exempel:</span> Du tippar att Sverige vinner Grupp F och möter andraplatsen i Grupp E i sextondelsfinal. Sverige vinner turneringen — men som tvåa i gruppen, via en annan bracket-gren. Du får <span className="text-swe-yellow font-medium">halvt poäng</span> för varje runda Sverige tar sig igenom, inte noll. Landet är rätt, vägen är fel.
                </p>
              </div>
            </div>
          </Section>

          {/* ── BONUS ── */}
          <Section title="Bonus">
            <PointsGroup
              rows={[
                { pts: '5', label: 'Turneringsskyttekung', desc: 'Rätt skyttekung för hela VM' },
              ]}
            />
          </Section>

          {/* ── SEEDNING ── */}
          <Section title="Hur seedningen fungerar">
            <p className="text-white/60 leading-relaxed">
              Slutspelsbracket byggs automatiskt från dina grupptabeller enligt FIFA:s officiella Annex C-regler.
              Vinnarna av varje grupp och de 8 bästa tredjeplacerade seeddas in i sextondelsfinal-bracketen.
              Om du ändrar din grupptabell-ordning påverkar det vilka lag du möter i slutspelet.
            </p>
          </Section>

        </div>
      </main>

      <Footer userName={user?.email ?? null} />
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 shrink-0 self-stretch bg-swe-yellow" />
        <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-none">
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </div>
  )
}

// ── Points group — scannable grid ─────────────────────────────────────────────

function PointsGroup({ rows }: { rows: { pts: string; label: string; desc: string }[] }) {
  return (
    <div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-start gap-5 py-4 border-b last:border-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="shrink-0">
            <span className="font-mono font-bold tnum text-swe-yellow leading-none whitespace-nowrap" style={{ fontSize: '26px' }}>
              {r.pts}
            </span>
            <span className="block text-[10px] font-display font-black uppercase tracking-widest text-swe-yellow/50 mt-0.5">
              poäng
            </span>
          </div>
          <div className="pt-0.5">
            <div className="font-display font-black text-lg uppercase tracking-wide text-white leading-tight">{r.label}</div>
            <p className="text-white/50 text-sm mt-1 leading-relaxed">{r.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Annan väg SVG bracket diagram ─────────────────────────────────────────────

function AnnanVagDiagram() {
  const yellow = '#FFC000'
  const dim = 'rgba(255,255,255,0.15)'
  const textDim = 'rgba(255,255,255,0.45)'
  const textFaint = 'rgba(255,255,255,0.25)'

  return (
    <div className="border border-white/10 bg-navy-900 px-4 py-6 overflow-x-auto">
      <svg viewBox="0 0 640 200" className="w-full max-w-xl" style={{ minWidth: '320px' }}>

        {/* ── LEFT SIDE: Rätt väg ──────────────────────── */}
        {/* Label */}
        <text x="8" y="16" fill={yellow} fontSize="11" fontFamily="Barlow Condensed" fontWeight="900" textAnchor="start" letterSpacing="1">
          RÄTT VÄG = FULL POÄNG
        </text>

        {/* R16 match box — top path */}
        <rect x="8" y="28" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="44" y="44" fill="white" fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag A</text>

        <rect x="8" y="56" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="44" y="72" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag B</text>

        {/* connector right */}
        <line x1="80" y1="40" x2="96" y2="40" stroke={dim} strokeWidth="1" />
        <line x1="80" y1="68" x2="96" y2="68" stroke={dim} strokeWidth="1" />
        <line x1="96" y1="40" x2="96" y2="68" stroke={dim} strokeWidth="1" />
        <line x1="96" y1="54" x2="112" y2="54" stroke={dim} strokeWidth="1" />

        {/* QF match box — top path */}
        <rect x="112" y="40" width="72" height="24" fill="none" stroke={yellow} strokeWidth="1.5" />
        <text x="148" y="56" fill={yellow} fontSize="10" fontFamily="Barlow Condensed" fontWeight="900" textAnchor="middle">Lag A</text>

        {/* R16 match box — bottom path (same side) */}
        <rect x="8" y="104" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="44" y="120" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag C</text>

        <rect x="8" y="132" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="44" y="148" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag D</text>

        <line x1="80" y1="116" x2="96" y2="116" stroke={dim} strokeWidth="1" />
        <line x1="80" y1="144" x2="96" y2="144" stroke={dim} strokeWidth="1" />
        <line x1="96" y1="116" x2="96" y2="144" stroke={dim} strokeWidth="1" />
        <line x1="96" y1="130" x2="112" y2="130" stroke={dim} strokeWidth="1" />

        <rect x="112" y="116" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="148" y="132" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag E</text>

        {/* SF connector */}
        <line x1="184" y1="52" x2="200" y2="52" stroke={yellow} strokeWidth="1.5" />
        <line x1="184" y1="128" x2="200" y2="128" stroke={dim} strokeWidth="1" />
        <line x1="200" y1="52" x2="200" y2="128" stroke={dim} strokeWidth="1" />
        <line x1="200" y1="90" x2="216" y2="90" stroke={dim} strokeWidth="1" />

        {/* SF box */}
        <rect x="216" y="76" width="72" height="24" fill="none" stroke={yellow} strokeWidth="2" />
        <text x="252" y="92" fill={yellow} fontSize="10" fontFamily="Barlow Condensed" fontWeight="900" textAnchor="middle">Lag A ✓</text>

        <text x="8" y="190" fill={textDim} fontSize="9" fontFamily="Inter" textAnchor="start">
          Lag A följde din tippade bracket-väg → full poäng
        </text>

        {/* ── RIGHT SIDE: Annan väg ──────────────────────── */}
        {/* Label */}
        <text x="348" y="16" fill={textDim} fontSize="11" fontFamily="Barlow Condensed" fontWeight="900" textAnchor="start" letterSpacing="1">
          ANNAN VÄG = HALVT POÄNG
        </text>

        {/* Top bracket — Lag A knocked out early */}
        <rect x="348" y="28" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="384" y="44" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag X</text>

        <rect x="348" y="56" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="384" y="72" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag A</text>

        <line x1="420" y1="40" x2="436" y2="40" stroke={dim} strokeWidth="1" />
        <line x1="420" y1="68" x2="436" y2="68" stroke={dim} strokeWidth="1" />
        <line x1="436" y1="40" x2="436" y2="68" stroke={dim} strokeWidth="1" />
        <line x1="436" y1="54" x2="452" y2="54" stroke={dim} strokeWidth="1" />

        <rect x="452" y="40" width="72" height="24" fill="none" stroke={yellow} strokeWidth="1.5" />
        <text x="488" y="56" fill={yellow} fontSize="10" fontFamily="Barlow Condensed" fontWeight="900" textAnchor="middle">Lag A</text>

        {/* Bottom bracket — Lag A comes through other side */}
        <rect x="348" y="104" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="384" y="120" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag F</text>

        <rect x="348" y="132" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="384" y="148" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag G</text>

        <line x1="420" y1="116" x2="436" y2="116" stroke={dim} strokeWidth="1" />
        <line x1="420" y1="144" x2="436" y2="144" stroke={dim} strokeWidth="1" />
        <line x1="436" y1="116" x2="436" y2="144" stroke={dim} strokeWidth="1" />
        <line x1="436" y1="130" x2="452" y2="130" stroke={dim} strokeWidth="1" />

        <rect x="452" y="116" width="72" height="24" fill="none" stroke={dim} strokeWidth="1" />
        <text x="488" y="132" fill={textFaint} fontSize="10" fontFamily="Barlow Condensed" fontWeight="700" textAnchor="middle">Lag H</text>

        {/* SF connector */}
        <line x1="524" y1="52" x2="540" y2="52" stroke={yellow} strokeWidth="1.5" />
        <line x1="524" y1="128" x2="540" y2="128" stroke={dim} strokeWidth="1" />
        <line x1="540" y1="52" x2="540" y2="128" stroke={dim} strokeWidth="1" />
        <line x1="540" y1="90" x2="556" y2="90" stroke={dim} strokeWidth="1" />

        {/* SF — Lag A wins but via different path than tipped */}
        <rect x="556" y="76" width="72" height="24" fill="none" stroke={yellow} strokeWidth="2" strokeDasharray="4 2" />
        <text x="592" y="92" fill={yellow} fontSize="10" fontFamily="Barlow Condensed" fontWeight="900" textAnchor="middle">Lag A ½</text>

        <text x="348" y="190" fill={textDim} fontSize="9" fontFamily="Inter" textAnchor="start">
          Lag A nådde samma runda men via fel bracket-gren → halvt
        </text>
      </svg>
    </div>
  )
}
