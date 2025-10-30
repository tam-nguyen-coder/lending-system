# Internal Approval System (IAS)

A modern, scalable web application built with Next.js for managing internal expense and loan requests with dynamic business rules.

## Features

### Core Capabilities

- **Dynamic Rule Engine**: Business logic is decoupled from code using `json-rules-engine`, allowing admins to modify approval criteria without deployments
- **Role-Based Access**: Employees submit requests, admins manage approvals and rules
- **Real-Time Dashboards**: View request history and status with instant updates
- **Admin Panel**: Manage all requests across the organization with manual override capabilities
- **Rule Editor**: Visual JSON editor for creating and updating business rules
- **Public API**: REST endpoint for external integrations (Slack bots, mobile apps, etc.)

### Technology Stack

- **Framework**: Next.js 16+ (App Router with React Server Components)
- **UI Components**: Shadcn/UI
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form with Zod validation
- **State Management**: Zustand (for global client state)
- **Backend**: Next.js Server Actions (primary) + API Routes (external)
- **Business Logic**: json-rules-engine
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (SSO/Magic Link support)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lending-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
API_KEY=your_api_key_for_external_integrations
```

4. Set up the Supabase database:
- Go to your Supabase project
- Open the SQL Editor
- Run the SQL from `database-setup.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First User Setup

1. Sign up for an account at `/login`
2. By default, new users are assigned the `employee` role
3. To create an admin user:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com'`

## Project Structure

```
src/
├── app/
│   ├── api/              # Public REST API endpoints
│   ├── admin/            # Admin-only pages
│   │   ├── dashboard/    # Admin request management
│   │   └── rules/        # Rule engine editor
│   ├── dashboard/        # Employee dashboard
│   │   └── request/      # Request submission
│   ├── login/            # Authentication
│   ├── layout.js         # Root layout
│   ├── page.js           # Landing page
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # Shadcn/UI components
├── lib/
│   ├── auth.js           # Authentication utilities
│   ├── schemas.js        # Zod validation schemas
│   ├── supabase/         # Supabase clients
│   ├── rules-engine.js   # Rules processing logic
│   └── types.js          # Type definitions
└── middleware.js         # Route protection
```

## Architecture Highlights

### Server Components by Default

The application follows Next.js best practices by using Server Components (RSC) as the default. Client Components (`'use client'`) are only used when necessary (hooks, browser APIs).

### Feature-Based Organization

Code is organized by feature rather than by file type:
- Each route contains its own `actions.ts` (Server Actions)
- Route-specific components in `_components/`
- Shared logic colocated with related code

### Security

- All routes protected by middleware
- Row Level Security (RLS) enabled on all tables
- API key authentication for external endpoints
- Server-side validation with Zod
- Server Actions for all internal mutations

### Performance

- Server Components for data fetching (no client-side fetching)
- Automatic revalidation with `revalidatePath`
- Optimistic updates where appropriate
- Minimal JavaScript shipped to client

## Usage Examples

### Submitting a Request (Employee)

1. Navigate to `/dashboard`
2. Click "New Request"
3. Fill out the form:
   - Select type (Expense or Loan)
   - Enter amount
   - Provide reason
4. Submit - the rules engine automatically processes it

### Managing Requests (Admin)

1. Navigate to `/admin/dashboard`
2. View all requests across the organization
3. Approve or reject pending requests
4. Filter and search as needed

### Editing Rules (Admin)

1. Navigate to `/admin/rules`
2. Add new rules or edit existing ones
3. Rules use JSON with json-rules-engine syntax
4. Example rule:
```json
{
  "name": "Auto-approve small expenses",
  "priority": 10,
  "conditions": {
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
  },
  "event": {
    "type": "auto-approve",
    "params": {
      "message": "Auto-approved: small expense"
    }
  }
}
```

### Using the Public API

```bash
curl -H "x-api-key: your_api_key" \
  https://your-domain.com/api/requests/{request-id}/status
```

Returns:
```json
{
  "status": "approved",
  "type": "expense",
  "amount": 50.00
}
```

## Database Schema

### profiles
- `id` (UUID, FK to auth.users)
- `email` (TEXT)
- `role` (TEXT: 'employee' | 'admin')

### requests
- `id` (UUID)
- `user_id` (UUID, FK to profiles)
- `type` (TEXT: 'expense' | 'loan')
- `amount` (NUMERIC)
- `reason` (TEXT)
- `status` (TEXT: 'pending' | 'approved' | 'rejected')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### rules
- `id` (UUID)
- `name` (TEXT)
- `priority` (INTEGER)
- `conditions` (JSONB)
- `event` (JSONB)

## Development

### Adding a New Feature

1. Create route in appropriate directory (`/app`)
2. Add Server Action if mutation needed (colocate in `actions.js`)
3. Add Zod schema for validation (`/lib/schemas.js`)
4. Update types if needed (`/lib/types.js`)
5. Add RLS policy in Supabase if new table/access pattern

### Code Style

- Server Components by default
- Client Components for interactivity only
- Feature-based file organization
- Zod for all validation
- Type safety with JSDoc types
- Clear error handling in Server Actions

## Deployment

### Vercel (Recommended)

1. Push code to GitHub/GitLab
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

Environment variables needed:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `API_KEY`

## Contributing

This project follows the technical guidelines outlined in `technical-guidelines.md`. Key principles:

1. Clarity > Brevity
2. Server Components by default
3. Feature-based organization
4. Type safety with Zod
5. Comprehensive error handling

## License

MIT
