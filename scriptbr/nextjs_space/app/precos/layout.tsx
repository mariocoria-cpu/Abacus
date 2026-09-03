import { AppHeader } from '@/components/app-header'

export default function PrecosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-6">
        {children}
      </main>
    </div>
  )
}
