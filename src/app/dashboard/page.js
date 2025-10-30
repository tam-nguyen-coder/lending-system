import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { signOut } from '@/app/login/actions'

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUser()

  if (!user || !profile) {
    redirect('/login')
  }

  const supabase = await createServerClient()
  
  const { data: requests, error } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', user.id)
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
          <h1 className="text-2xl font-bold">Internal Approval System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{profile.email}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {profile.role}
            </span>
            {profile.role === 'admin' && (
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  Admin Panel
                </Button>
              </Link>
            )}
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Requests</h2>
          <Link href="/dashboard/request/new">
            <Button>New Request</Button>
          </Link>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">Error loading requests: {error.message}</p>
            </CardContent>
          </Card>
        ) : requests && requests.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No requests yet</CardTitle>
              <CardDescription>
                Get started by submitting your first request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/request/new">
                <Button>Create Request</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

