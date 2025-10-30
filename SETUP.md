# Setup Guide

This guide will walk you through setting up the Internal Approval System.

## Prerequisites

1. Node.js 18+ installed
2. A Supabase account (sign up at https://supabase.com)
3. Git (for cloning the repository)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd lending-system

# Install dependencies
npm install
```

**Note:** This project uses `@supabase/ssr` for proper authentication session management with Next.js 16. It will be installed automatically with the dependencies.

## Step 2: Set Up Supabase

1. **Create a new Supabase project:**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in your project details
   - Note your project URL and anon key

2. **Run the database setup:**
   - In your Supabase project, go to "SQL Editor"
   - Open the file `database-setup.sql` from this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

3. **Configure authentication:**
   - Go to Authentication → Providers
   - Enable "Email" provider
   - Optionally enable other providers (Magic Link, OAuth, etc.)

## Step 3: Configure Environment Variables

1. **Create `.env.local` file** (already created with placeholders):

```bash
# Copy the example file
cp .env.example .env.local
```

2. **Fill in your actual values:**

```bash
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Generate a secure API key for external integrations
API_KEY=generate-a-secure-random-key-here
```

3. **Get your Supabase credentials:**
   - Go to Project Settings → API
   - Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 4: Run the Application

```bash
# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 5: Create Your First User

1. Go to http://localhost:3000/login
2. Click "Create new account"
3. Enter your email and password
4. Check your email for the confirmation link
5. Click the link to verify your account

## Step 6: Create an Admin User

By default, all users are created as "employees". To create an admin:

1. Go to your Supabase project
2. Open "Table Editor"
3. Select the `profiles` table
4. Find your user
5. Click edit and change `role` from `employee` to `admin`
6. Save

Or use SQL:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Step 7: Test the Application

### As an Employee:

1. Log in at http://localhost:3000/login
2. Go to Dashboard
3. Click "New Request"
4. Submit a test request (e.g., $50 expense)
5. See it appear in your dashboard

### As an Admin:

1. Log in with your admin account
2. Click "Admin Panel"
3. See all requests from all users
4. Approve/reject pending requests
5. Go to "Rule Editor" to manage business rules

## Step 8: Configure Business Rules (Optional)

1. Go to Admin Panel → Rule Editor
2. Click "Add Rule"
3. Configure your rule:
   - **Name**: e.g., "Auto-approve small expenses"
   - **Priority**: Higher numbers run first (e.g., 10)
   - **Conditions**: JSON defining when the rule applies
   - **Event**: What happens when conditions match

Example rule for auto-approving expenses under $100:

```json
{
  "all": [
    {
      "fact": "amount",
      "operator": "lessThan",
      "value": 100
    },
    {
      "fact": "type",
      "operator": "equal",
      "value": "expense"
    }
  ]
}
```

Event:
```json
{
  "type": "auto-approve",
  "params": {
    "message": "Auto-approved: small expense"
  }
}
```

## Troubleshooting

### Build fails with "Missing Supabase environment variables"

- Ensure `.env.local` exists with correct values
- Restart the dev server after changing env vars

### Can't log in / Authentication errors

- Check Supabase Authentication settings
- Ensure email provider is enabled
- Check your email for the confirmation link
- Clear browser cookies for localhost:3000
- Visit `/debug-auth` to check authentication status

### "Unauthorized" when accessing admin pages

- Verify your user role is set to `admin` in the profiles table
- Check RLS policies are set up correctly

### Rules aren't working

- Check the rules table has data
- Verify JSON syntax is valid
- Check server logs for errors

### Database connection issues

- Verify your Supabase credentials are correct
- Check your Supabase project is running
- Ensure RLS policies are configured

## Next Steps

- Customize the business rules for your organization
- Set up email notifications (future feature)
- Integrate with Slack/Teams
- Deploy to Vercel (see README.md)

## Support

For issues or questions, refer to:
- `README.md` - Full documentation
- `requirements.md` - Feature specifications
- `technical-guidelines.md` - Development standards

