export const dynamic = 'force-dynamic'

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-5xl">✅</div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Tips inskickat!</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Ditt tips är registrerat. Du är med i spelet när Erik bekräftat din Swish-betalning.
          </p>
        </div>
        <div className="border border-yellow-800 bg-yellow-900/10 p-4 text-left">
          <div className="text-xs text-yellow-600 uppercase tracking-wider mb-2">Kom ihåg att Swisha!</div>
          <div className="text-sm text-yellow-300 font-bold">100 kr · Erik Engstrand · 0768919007</div>
        </div>
        <div className="flex flex-col gap-2">
          <a href="/dashboard" className="block py-2.5 px-6 bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
            Se tabellen →
          </a>
          <a href="/" className="block py-2 text-xs text-gray-500 hover:text-white">
            Tillbaka till startsidan
          </a>
        </div>
      </div>
    </div>
  )
}
