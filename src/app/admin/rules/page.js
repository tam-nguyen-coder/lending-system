import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RuleEditor from './_components/rule-editor'
import { signOut } from '@/app/login/actions'

export default async function AdminRulesPage() {
  const { user, profile } = await getCurrentUser()

  if (!user || !profile) {
    redirect('/login')
  }

  try {
    await requireAdmin()
  } catch {
    redirect('/dashboard')
  }

  const supabase = await createServerClient()
  
  const { data: rules, error } = await supabase
    .from('rules')
    .select('*')
    .order('priority', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rule Engine Editor</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                My Requests
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                Admin Dashboard
              </Button>
            </Link>
            <span className="text-sm text-gray-600">{profile.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Business Rules</h2>
          <p className="text-gray-600">
            Edit the rules that automatically process requests. Rules are evaluated in priority order.
          </p>
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-4 text-red-600">
            Error loading rules: {error.message}
          </div>
        ) : (
          <RuleEditor initialRules={rules || []} />
        )}
      </main>
    </div>
  )
}

