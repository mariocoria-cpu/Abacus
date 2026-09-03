import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { HistoryClient } from '@/components/history/history-client'

export default async function HistoricoPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return <HistoryClient />
}
