import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { EditableImage } from '@/components/Editable'

export const dynamic = 'force-dynamic'

export default async function ReglerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <div className="label mb-1">Spelregler</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">Regler &amp; Poängsystem</h1>
        </div>

        {/* Admin-redigerbar bannerbild */}
        <EditableImage
          contentKey="image.regler.banner"
          alt="Regelsbild"
          className="w-full object-cover max-h-48"
          containerClassName="mb-6"
          placeholderHeight="h-32"
        />

        <div className="space-y-6 text-sm">
          <Section title="Deadline">
            <p className="text-white/60 leading-relaxed">
              Alla tips måste vara inlämnade och betalda senast{' '}
              <strong className="text-white">11 juni 2026 kl 17:00</strong>{' '}
              (innan turneringen startar). Tips som lämnas in efter detta datum gäller inte.
            </p>
          </Section>

          <Section title="Deltagande &amp; Betalning">
            <p className="text-white/60 leading-relaxed mb-3">
              Insatsen är <strong className="text-white">100 kr per person</strong>, betalas via Swish till:
            </p>
            <div className="border border-swe-yellow/30 bg-swe-yellow/5 p-4 text-center">
              <span className="font-display font-black text-swe-yellow tracking-wider">ERIK ENGSTRAND · 0768919007</span>
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
            <div className="border border-white/10 divide-y divide-white/5">
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
    <div className="border border-white/10">
      <div className="px-4 py-3 bg-navy-900 border-b border-white/10">
        <h2 className="font-display font-black uppercase text-sm tracking-wider text-white">{title}</h2>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  )
}

function ScoreRow({ label, points }: { label: string; points: string }) {
  return (
    <div className="flex justify-between items-center py-2 text-xs">
      <span className="text-white/55">{label}</span>
      <span className="font-display font-black text-swe-yellow ml-4 whitespace-nowrap">{points}</span>
    </div>
  )
}
