export const dynamic = 'force-dynamic'
import Link from 'next/link'

export default function ReglerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-xs text-gray-500 hover:text-white">← Tillbaka</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Regler &amp; Poängsystem</h1>

      <div className="space-y-6 text-sm text-gray-300">
        <Section title="Deadline">
          <p>Alla tips måste vara inlämnade och betalda senast <strong className="text-white">11 juni 2026</strong> kl 17:00 (innan turneringen startar). Tips som lämnas in efter detta datum gäller inte.</p>
        </Section>

        <Section title="Deltagande &amp; Betalning">
          <p>Insatsen är <strong className="text-white">100 kr per person</strong>, betalas via Swish till:</p>
          <div className="border border-yellow-800 bg-yellow-900/10 p-3 my-2 text-center">
            <span className="text-yellow-400 font-bold">Erik Engstrand · 0768919007</span>
          </div>
          <p>Du är officiellt med i spelet när Erik bekräftat din betalning. Bekräftelse syns på din profilsida.</p>
        </Section>

        <Section title="Gruppspel — 1/X/2-tips">
          <Row label="Rätt utfall (1, X eller 2)" points="1 poäng" />
          <p className="text-gray-500 text-xs mt-1">Totalt 36 matcher × 1 poäng = max 36 poäng</p>
        </Section>

        <Section title="Grupptabeller">
          <Row label="Rätt lag på exakt rätt plats (1:a–4:e)" points="2 poäng" />
          <Row label="Rätt lag men en plats fel" points="1 poäng" />
          <p className="text-gray-500 text-xs mt-1">Totalt 12 grupper × 4 lag = max 96 poäng</p>
        </Section>

        <Section title="Tredjeplacerade som går vidare">
          <Row label="Rätt gissat att ett trea-lag går vidare" points="1 poäng" />
          <p className="text-gray-500 text-xs mt-1">8 av 12 tredjeplacerade går vidare. Max 8 poäng.</p>
        </Section>

        <Section title="Gruppskyttekungar">
          <Row label="Rätt skyttekung i en grupp" points="3 poäng" />
          <p className="text-gray-500 text-xs mt-1">12 grupper × 3 poäng = max 36 poäng</p>
        </Section>

        <Section title="Slutspelet — Brackettips">
          <p className="mb-2">Poäng ges för varje match i slutspelet där du gissar rätt vinnare.</p>
          <div className="border border-surface-600 divide-y divide-surface-700">
            <Row label="Omgång 32 — rätt lag, rätt plats" points="2 poäng" />
            <Row label="Omgång 32 — rätt lag, annan väg" points="1 poäng" />
            <Row label="Åttondelsfinaler — rätt/annan väg" points="3 / 1,5 poäng" />
            <Row label="Kvartsfinaler — rätt/annan väg" points="4 / 2 poäng" />
            <Row label="Semifinaler — rätt/annan väg" points="5 / 2,5 poäng" />
            <Row label="Bronsmatch — rätt/annan väg" points="3 / 1,5 poäng" />
            <Row label="Final — rätt vinnare, rätt path" points="6 poäng" />
            <Row label="Final — rätt vinnare, annan väg" points="3 poäng" />
          </div>
          <p className="text-gray-500 text-xs mt-2">
            <strong className="text-gray-400">&ldquo;Annan väg&rdquo;</strong> = laget nådde den rundan men via en annan bracket-gren än du tippade (halvt poäng).
          </p>
        </Section>

        <Section title="Turneringsskyttekung (bonus)">
          <Row label="Rätt skyttekung för hela VM" points="5 poäng" />
        </Section>

        <Section title="Hur seedningen fungerar">
          <p>Slutspelsbracket byggs automatiskt från dina grupptabeller enligt FIFA:s officiella Annex C-regler. Vinnarna av varje grupp och de 8 bästa tredjeplacerade seeddas in i R32-bracket. Om du ändrar din grupptabell-ordning påverkar det vilka lag du möter i slutspelet.</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-white mb-2 pb-1 border-b border-surface-700">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, points }: { label: string; points: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 px-2 text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="font-bold text-yellow-400 ml-2 whitespace-nowrap">{points}</span>
    </div>
  )
}
