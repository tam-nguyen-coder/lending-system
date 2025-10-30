import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateRequestStatusAction } from './actions'
import { signOut } from '@/app/login/actions'

export default async function AdminDashboardPage() {
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
  
  const { data: requests, error } = await supabase
    .from('requests')
    .select(`
      *,
      profiles!requests_user_id_fkey(email)
    `)
    .order('created_at', { ascending: false })

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                My Requests
              </Button>
            </Link>
            <Link href="/admin/rules">
              <Button variant="outline" size="sm">
                Rule Editor
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

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">All Requests</h2>

        {error ? (
          <Card>
            <div className="p-6">
              <p className="text-red-600">Error loading requests: {error.message}</p>
            </div>
          </Card>
        ) : requests && requests.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.profiles?.email || 'Unknown'}</TableCell>
                    <TableCell className="capitalize">{request.type}</TableCell>
                    <TableCell>${request.amount.toFixed(2)}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <form action={updateRequestStatusAction.bind(null, request.id, 'approved')}>
                            <Button type="submit" size="sm" variant="outline" className="text-green-600">
                              Approve
                            </Button>
                          </form>
                          <form action={updateRequestStatusAction.bind(null, request.id, 'rejected')}>
                            <Button type="submit" size="sm" variant="outline" className="text-red-600">
                              Reject
                            </Button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No action</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <div className="p-6">
              <p className="text-gray-600">No requests found</p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}

