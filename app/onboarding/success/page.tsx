export const dynamic = 'force-dynamic'

export default function SuccessPage() {
  return (
    <main className="relative min-h-screen bg-navy-950 overflow-hidden flex items-center justify-center px-4">
      {/* Celebration background */}
      <img
        src="/images/gyokeres-action.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ zIndex: 0 }}
      />
      <div className="absolute inset-0 bg-navy-950/70" style={{ zIndex: 1 }} />

      <div className="relative max-w-md w-full text-center space-y-6" style={{ zIndex: 10 }}>
        <div>
          <div className="font-display font-black text-5xl text-swe-yellow uppercase tracking-wide mb-2">Klart!</div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide text-white mb-2">Tips inskickat</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Ditt tips är registrerat. Du är med i spelet när Erik bekräftat din Swish-betalning.
          </p>
        </div>

        <div className="border border-swe-yellow/30 bg-swe-yellow/5 p-4 text-left">
          <div className="label text-swe-yellow/60 mb-2">Kom ihåg att Swisha!</div>
          <div className="font-display font-black text-lg text-swe-yellow uppercase tracking-wide">100 kr · Erik Engstrand · 0768919007</div>
        </div>

        <div className="flex flex-col gap-2">
          <a href="/dashboard" className="btn-primary">
            Se tabellen →
          </a>
          <a href="/" className="text-xs text-white/30 hover:text-white py-2 transition-colors">
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </main>
  )
}
