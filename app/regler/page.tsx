import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Image from 'next/image'

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
          <Section title="Deadline">
            <p className="text-white/60 leading-relaxed">
              Alla tips måste vara inlämnade och betalda senast{' '}
              <strong className="text-white">11 juni 2026 kl 17:00</strong>{' '}
              (innan turneringen startar). Tips som lämnas in efter detta datum gäller inte.
            </p>
          </Section>

          <Section title="Deltagande &amp; Betalning">
            <p className="text-white/60 leading-relaxed mb-4">
              Insatsen är <strong className="text-white">100 kr per person</strong>, betalas via Swish till:
            </p>
            <div className="border border-swe-yellow/30 bg-swe-yellow/5 px-6 py-5">
              <div className="font-display font-black text-3xl sm:text-4xl text-swe-yellow tracking-wider leading-none">100 KR</div>
              <div className="font-display font-black text-lg text-white/60 mt-2 uppercase tracking-wider">Erik Engstrand · 0768919007</div>
            </div>
            <p className="text-white/40 text-xs mt-3 leading-relaxed">
              Du är officiellt med i spelet när Erik bekräftat din betalning. Bekräftelse syns på din profilsida.
            </p>
          </Section>

          <Section title="Gruppspel — 1/X/2-tips">
            <ScoreRow label="Rätt utfall (1, X eller 2)" points="1 poäng" />
            <p className="text-white/30 text-xs mt-2">Totalt 36 matcher × 1 poäng = max 36 poäng</p>
          </Section>

          <Section title="Grupptabeller">
            <ScoreRow label="Rätt lag på exakt rätt plats (1:a–4:e)" points="2 poäng" />
            <ScoreRow label="Rätt lag men en plats fel" points="1 poäng" />
            <p className="text-white/30 text-xs mt-2">Totalt 12 grupper × 4 lag = max 96 poäng</p>
          </Section>

          <Section title="Tredjeplacerade som går vidare">
            <ScoreRow label="Rätt gissat att ett trea-lag går vidare" points="1 poäng" />
            <p className="text-white/30 text-xs mt-2">8 av 12 tredjeplacerade går vidare. Max 8 poäng.</p>
          </Section>

          <Section title="Gruppskyttekungar">
            <ScoreRow label="Rätt skyttekung i en grupp" points="3 poäng" />
            <p className="text-white/30 text-xs mt-2">12 grupper × 3 poäng = max 36 poäng</p>
          </Section>

          <Section title="Slutspelet — Brackettips">
            <p className="text-white/60 leading-relaxed mb-3">
              Poäng ges för varje match i slutspelet där du gissar rätt vinnare.
            </p>
            <div>
              <ScoreRow label="Sextondelsfinal — rätt lag, rätt plats" points="2 poäng" />
              <ScoreRow label="Sextondelsfinal — rätt lag, annan väg" points="1 poäng" />
              <ScoreRow label="Åttondelsfinaler — rätt/annan väg" points="3 / 1,5 poäng" />
              <ScoreRow label="Kvartsfinaler — rätt/annan väg" points="4 / 2 poäng" />
              <ScoreRow label="Semifinaler — rätt/annan väg" points="5 / 2,5 poäng" />
              <ScoreRow label="Bronsmatch — rätt/annan väg" points="3 / 1,5 poäng" />
              <ScoreRow label="Final — rätt vinnare, rätt path" points="6 poäng" />
              <ScoreRow label="Final — rätt vinnare, annan väg" points="3 poäng" />
            </div>
            <p className="text-white/30 text-xs mt-2 leading-relaxed">
              <strong className="text-white/50">&ldquo;Annan väg&rdquo;</strong> = laget nådde den rundan men via en annan bracket-gren (halvt poäng).
            </p>
          </Section>

          <Section title="Turneringsskyttekung (bonus)">
            <ScoreRow label="Rätt skyttekung för hela VM" points="5 poäng" />
          </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-none mb-2">
        {title}
      </h2>
      <div className="h-[2px] w-10 bg-swe-yellow mb-6" />
      <div>{children}</div>
    </div>
  )
}

function ScoreRow({ label, points }: { label: string; points: string }) {
  return (
    <div className="flex items-center gap-5 py-3.5 border-b border-white/8 last:border-0">
      <div className="w-44 shrink-0">
        <span className="font-display font-black text-xl lg:text-2xl text-swe-yellow leading-none whitespace-nowrap">{points}</span>
      </div>
      <span className="text-white/55 text-sm leading-relaxed">{label}</span>
    </div>
  )
}
