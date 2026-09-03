import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { GeneratorClient } from '@/components/generator/generator-client'

export default async function GerarPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return <GeneratorClient />
}
