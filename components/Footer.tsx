import Link from 'next/link'

interface FooterProps {
  userName?: string | null
}

export default function Footer({ userName }: FooterProps) {
  return (
    <footer className="border-t border-white/10 mt-16 py-6">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between text-[11px] text-white/20">
        <span className="font-display font-black uppercase tracking-wider">
          VM<span className="text-swe-yellow/40">-TIPS 26</span>
        </span>
        <div className="flex items-center gap-5">
          <Link href="/regler" className="hover:text-white/50 transition-colors uppercase tracking-wider font-display font-black">Regler</Link>
          <Link href="/worldcup-guide" className="hover:text-white/50 transition-colors uppercase tracking-wider font-display font-black">VM-Guide</Link>
          <Link
            href={userName ? '/admin' : '/login'}
            className="hover:text-white/50 transition-colors uppercase tracking-wider font-display font-black"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
