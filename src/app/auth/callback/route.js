import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString()

  // Handle PKCE flow (code)
  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardTo = redirectTo ?? '/dashboard'
      return NextResponse.redirect(`${origin}${forwardTo}`)
    }
  }

  // Handle magic link flow (token)
  if (token && type === 'magiclink') {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(token)
    
    if (!error) {
      const forwardTo = redirectTo ?? '/dashboard'
      return NextResponse.redirect(`${origin}${forwardTo}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

