import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import RequestForm from './_components/request-form'

export default async function NewRequestPage() {
  const { user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">New Request</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <RequestForm />
      </main>
    </div>
  )
}

