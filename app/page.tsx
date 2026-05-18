import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: status } = await supabase
      .from('submission_status')
      .select('submitted')
      .eq('user_id', user.id)
      .single()

    if (status?.submitted) redirect('/dashboard')
    else redirect('/onboarding/group-stage')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo / Hero */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl">⚽</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            VM<span className="text-gradient">-tips 26</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Tippa VM 2026 och tävla mot dina vänner
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🏆', label: 'Gruppspel', desc: '72 matcher' },
            { icon: '⚡', label: 'Slutspel', desc: 'Hela trädet' },
            { icon: '🥅', label: 'Skytteligor', desc: 'Grupp + turnering' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="card py-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-sm font-semibold text-gray-200">{label}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link href="/register" className="btn-primary text-base py-3">
            Skapa konto
          </Link>
          <Link href="/login" className="btn-secondary text-base py-3">
            Logga in
          </Link>
        </div>

        {/* Payment note */}
        <p className="text-xs text-gray-600">
          Anmälningsavgift: 100 kr via Swish · Bekräftas av Erik
        </p>
      </div>
    </main>
  )
}
