# Authentication Flow Documentation

This document describes the authentication flows implemented in the Internal Approval System.

## Overview

The application uses Supabase Authentication with the `@supabase/ssr` package for Next.js 16+ compatibility. Authentication supports two methods:

1. **Email/Password Login** - Traditional username/password authentication
2. **Magic Link Login** - Passwordless authentication via email link

Both methods use the same underlying Supabase Auth system but have different user flows.

## Architecture

### Key Files

- `src/lib/supabase/client.js` - Client-side Supabase client (browser)
- `src/lib/supabase/server.js` - Server-side Supabase client (with cookie handling)
- `src/lib/auth.js` - Authentication utility functions
- `src/app/login/page.js` - Login UI and handlers
- `src/app/auth/callback/route.js` - OAuth/Magic Link callback handler
- `src/proxy.js` - Route protection and authentication checks

### Client Configuration

```javascript
// src/lib/supabase/client.js
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
```

The `createBrowserClient` from `@supabase/ssr` automatically handles:
- Cookie persistence
- Session management
- Token refresh

### Server Configuration

```javascript
// src/lib/supabase/server.js
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) { return cookieStore.get(name)?.value },
      set(name, value, options) { cookieStore.set(name, value, options) },
      remove(name, options) { cookieStore.set(name, '', { ...options, maxAge: 0 }) }
    }
  })
}
```

The server client provides cookie handlers for Next.js middleware and server components.

## Flow 1: Email/Password Authentication

### User Journey

1. User enters email and password on `/login`
2. Form submission triggers `signInWithPassword()`
3. Supabase validates credentials
4. Session created and stored in cookies
5. User redirected to `/dashboard`

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        EMAIL/PASSWORD FLOW                       │
└─────────────────────────────────────────────────────────────────┘

User Browser                          Supabase                     Next.js Server
     │                                     │                              │
     │ 1. User enters email/password      │                              │
     │    on /login page                  │                              │
     │                                     │                              │
     │ 2. handleEmailLogin()              │                              │
     │    → signInWithPassword()          │                              │
     │────────────────────────────────────>│                              │
     │                                     │                              │
     │                                     │ 3. Validate credentials       │
     │                                     │    → Check email/password     │
     │                                     │                              │
     │ 4. Session tokens returned         │                              │
     │<────────────────────────────────────│                              │
     │                                     │                              │
     │ 5. @supabase/ssr stores tokens     │                              │
     │    in HTTP-only cookies            │                              │
     │                                     │                              │
     │ 6. Redirect to /dashboard          │                              │
     │─────────────────────────────────────────────────────────────────>│
     │                                     │                              │
     │                                     │   7. Proxy checks auth        │
     │                                     │      → getUser()              │
     │                                     │      → Cookies sent           │
     │                                     │                              │
     │                                     │   8. User authenticated       │
     │                                     │      → Allow access           │
     │                                     │                              │
     │ 9. Render dashboard                │                              │
     │<────────────────────────────────────────────────────────────────────
     │                                     │                              │
     │✓ User logged in                    │                              │
```

### Implementation Details

**Client-side (login page):**
```javascript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (!error) {
  router.push('/dashboard')
  router.refresh()
}
```

**What happens:**
- Client sends credentials to Supabase
- Supabase returns session tokens
- `@supabase/ssr` stores tokens in HTTP-only cookies
- Browser includes cookies in subsequent requests
- Server reads cookies to verify authentication

**Session persistence:**
- Cookies automatically sent with every request
- Tokens refreshed automatically by `@supabase/ssr`
- Works across page navigations (no manual session checks)

### Authentication Check (Route Protection)

When user accesses `/dashboard`:

**Proxy (middleware):**
```javascript
const supabase = await createServerClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.redirect('/login')
}
```

**Dashboard page:**
```javascript
const { user, profile } = await getCurrentUser()
// user - from Supabase Auth
// profile - from our profiles table

if (!user || !profile) {
  redirect('/login')
}
```

## Flow 2: Magic Link Authentication

### User Journey

1. User enters email on `/login` and clicks "Send magic link"
2. Supabase sends email with special link
3. User clicks link in email
4. Browser navigates to callback URL with authentication token
5. Callback route exchanges token for session
6. User redirected to `/dashboard`

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAGIC LINK FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User Browser                          Supabase                     Next.js Server
     │                                     │                              │
     │ 1. User enters email               │                              │
     │    clicks "Send magic link"        │                              │
     │                                     │                              │
     │ 2. handleMagicLink()               │                              │
     │    → signInWithOtp()               │                              │
     │────────────────────────────────────>│                              │
     │                                     │                              │
     │                                     │ 3. Generate token             │
     │                                     │    Send email with link       │
     │                                     │                              │
     │ 4. Response: Success               │                              │
     │    Show "Link sent" message        │                              │
     │<────────────────────────────────────│                              │
     │                                     │                              │
     │ ... User checks email ...          │                              │
     │                                     │                              │
     │ 5. User clicks link in email       │                              │
     │    Navigates to Supabase verify    │                              │
     │────────────────────────────────────>│                              │
     │                                     │                              │
     │                                     │ 6. Verify token               │
     │                                     │    Generate session code      │
     │                                     │                              │
     │ 7. Supabase redirects to callback  │                              │
     │    with code parameter             │                              │
     │<────────────────────────────────────│                              │
     │                                     │                              │
     │ 8. GET /auth/callback?code=...     │                              │
     │─────────────────────────────────────────────────────────────────>│
     │                                     │                              │
     │                                     │ 9. exchangeCodeForSession()  │
     │                                     │    → Create session           │
     │                                     │    → Store in cookies         │
     │                                     │                              │
     │10. Redirect to /dashboard          │                              │
     │<────────────────────────────────────────────────────────────────────
     │                                     │                              │
     │11. Proxy checks auth               │                              │
     │    User authenticated ✓            │                              │
     │                                     │                              │
     │12. Render dashboard                │                              │
     │<────────────────────────────────────────────────────────────────────
     │                                     │                              │
     │✓ User logged in                    │                              │
```

### Implementation Details

**Step 1: Request Magic Link**
```javascript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?redirect_to=/dashboard`,
  },
})
```

**What happens:**
- Supabase generates a unique, single-use token
- Email sent with link: `https://your-project.supabase.co/auth/v1/verify?token=XXX&type=magiclink&redirect_to=http://localhost:3000/auth/callback?redirect_to=/dashboard`
- User sees "Magic link sent" confirmation

**Step 2: User Clicks Link**

The email link redirects to Supabase's verify endpoint, which then redirects to our callback.

**Step 3: Callback Handles Session**

```javascript
// src/app/auth/callback/route.js
export async function GET(request) {
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  
  if (code) {
    // PKCE flow (default with @supabase/ssr)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect('/dashboard')
    }
  }
  
  if (token && type === 'magiclink') {
    // Legacy magic link flow
    const { error } = await supabase.auth.exchangeCodeForSession(token)
    if (!error) {
      return NextResponse.redirect('/dashboard')
    }
  }
}
```

**What happens:**
- Callback receives auth token from URL
- Exchanges token for full session
- Session stored in cookies (same as email/password)
- Redirects to dashboard

### Magic Link Configuration

**Supabase Settings:**
1. Authentication → URL Configuration
2. Add redirect URLs:
   - `http://localhost:3000/**` (development)
   - `https://your-domain.com/**` (production)

**Why configuration is needed:**
- Supabase requires explicit URL whitelisting for security
- Prevents redirect attacks
- Only configured URLs can complete authentication

## Route Protection

### How Proxy Works

The `proxy.js` file (formerly middleware) runs on every request:

```javascript
export async function proxy(request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Public paths
  const publicPaths = ['/login', '/', '/auth/callback']
  
  if (request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next() // Allow without auth
  }
  
  if (!user && !publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect('/login') // Require auth
  }
  
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect('/dashboard') // Auto-redirect logged in users
  }
  
  return NextResponse.next()
}
```

### Public vs Protected Routes

**Public (no auth required):**
- `/` - Landing page
- `/login` - Login page
- `/auth/callback` - OAuth/magic link callback

**Protected (auth required):**
- `/dashboard` - Employee dashboard
- `/dashboard/*` - All employee features

**Admin Only:**
- `/admin/*` - All admin features

### Role-Based Access

After authentication, we check user profile for role:

```javascript
const { user, profile } = await getCurrentUser()
// profile.role === 'employee' or 'admin'
```

Admin routes verify role:
```javascript
const { profile } = await getCurrentUser()
if (profile?.role !== 'admin') {
  redirect('/dashboard')
}
```

## Session Management

### How Sessions Work

**Client Side:**
- Browser stores session cookies (managed by `@supabase/ssr`)
- Cookies sent automatically with requests
- No manual session code needed in components

**Server Side:**
- Server reads cookies via `createServerClient()`
- Can check auth in any Server Component or Server Action
- No need to pass tokens manually

**Lifecycle:**
1. Login creates session → cookies stored
2. Every request → cookies sent → session verified
3. Token expiration → auto-refreshed by `@supabase/ssr`
4. Logout → cookies cleared

### Profile Creation

When a user signs up, a trigger automatically creates a profile:

```sql
-- database-setup.sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'employee');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Flow:**
1. User signs up → `auth.users` row created
2. Trigger fires → `profiles` row created
3. Default role: `employee`

## Troubleshooting

### "Auth session missing"

**Possible causes:**
1. `@supabase/ssr` not installed
2. Incorrect cookie handlers in server client
3. Cookie domain/path issues

**Fix:**
- Ensure `npm install @supabase/ssr` is run
- Verify server client has proper cookie handlers
- Check Supabase URL and anon key in `.env.local`

### "Cannot coerce result to single JSON object"

**Cause:** User authenticated but no profile in database

**Fix:**
```sql
INSERT INTO profiles (id, email, role)
SELECT id, email, 'employee' 
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

### Magic link redirects to login

**Possible causes:**
1. Redirect URL not configured in Supabase
2. Link opened in different browser/device
3. Link expired (typically 1 hour)

**Fix:**
- Configure redirect URLs in Supabase Dashboard
- Use same browser that requested link
- Request new link if expired

### ERR_TOO_MANY_REDIRECTS

**Cause:** Redirect loop between pages

**Common scenarios:**
- Callback route tries to check auth before session created
- Proxy redirects authenticated users away from login (normal behavior)

**Fix:**
- Ensure callback route doesn't check auth
- Don't manually redirect in callback before session exchange

## Security Considerations

### Row Level Security (RLS)

All database tables have RLS enabled:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
```

**Policies enforce:**
- Users can only see their own requests
- Admins can see all requests
- Only admins can manage rules
- Profile access based on user ID

### API Security

**Public API endpoint:**
- Requires API key in header
- Separate from web app authentication
- For external integrations only

**Server Actions:**
- Always validate input with Zod
- Check authentication in action
- Verify user permissions
- Never trust client data

### Cookie Security

Managed automatically by `@supabase/ssr`:
- HTTP-only cookies (not accessible to JavaScript)
- Secure flag in production (HTTPS only)
- SameSite protection against CSRF

## Testing Authentication

### Manual Testing

1. **Email/Password:**
   - Go to `/login`
   - Enter credentials
   - Should redirect to `/dashboard`

2. **Magic Link:**
   - Go to `/login`
   - Click "Send magic link"
   - Check email
   - Click link
   - Should redirect to `/dashboard`

3. **Session Persistence:**
   - Login
   - Refresh page
   - Should stay logged in
   - Navigate between pages
   - Should remain authenticated

4. **Logout:**
   - Click "Sign out"
   - Should redirect to login
   - Cannot access dashboard

5. **Role Checks:**
   - Employee: can access dashboard, cannot access admin
   - Admin: can access both dashboard and admin

### Debug Endpoints

Current setup doesn't include debug endpoints. To add:

```javascript
// src/app/api/test-auth/route.js
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return NextResponse.json({ authenticated: !!user })
}
```

## Summary

The authentication system uses:
- **Supabase Auth** for identity management
- **@supabase/ssr** for Next.js 16+ compatibility
- **Cookie-based sessions** for seamless auth
- **Server Components** for data fetching
- **Proxy (middleware)** for route protection
- **Database triggers** for profile creation
- **RLS policies** for data security

Both email/password and magic link flows end up with the same result: a secure, cookie-based session that persists across page loads and is automatically verified on the server.

