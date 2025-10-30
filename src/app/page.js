import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16">
        <div className="flex flex-col items-center gap-8 text-center mb-12">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Internal Approval System
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-gray-600">
            Streamline your expense and loan approval process with dynamic
            business rules that update without code changes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 w-full mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Smart Automation</CardTitle>
              <CardDescription>
                Dynamic rule engine automatically processes requests based on
                business logic that can be updated anytime.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Employees submit requests, admins manage approvals and rules.
                Clear separation of concerns.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Ready</CardTitle>
              <CardDescription>
                Built-in REST API for external integrations with Slack bots,
                mobile apps, or other services.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/login">
            <Button size="lg" className="w-full md:w-auto">
              Get Started
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Demo: Use admin@company.com / password to explore admin features
          </p>
        </div>
      </main>
    </div>
  )
}
