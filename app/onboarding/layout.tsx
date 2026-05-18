export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-900">
      {/* Progress bar placeholder — each step renders its own header */}
      {children}
    </div>
  )
}
