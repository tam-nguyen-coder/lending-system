1. Project Overview

Project Name: Internal Approval System (IAS)
Project Goal: To build a scalable, maintainable, and modern internal web application that allows employees to submit expense and loan requests, which are then automatically processed by a dynamic business logic engine.
Core Business Value: To decouple business logic (the "rules" of approval) from the application code. This allows the finance/admin team to modify approval criteria (e.g., change spending limits) without requiring new code deployments, reducing engineering bottlenecks.

2. User Roles & Permissions

This system will be built on Supabase Auth with Role-Based Access Control (RBAC), managed via a profiles table linked to auth.users.

2.1. Employee (Default Role)

Permissions:

Can log in via company SSO or Magic Link (handled by Supabase Auth).

Can create and submit new requests (expenses/loans).

Can view a history of their own requests and their current status (pending, approved, rejected).

Restrictions: Cannot view or access requests from other employees. Cannot view or modify the business rules.

2.2. Admin (Elevated Role)

Permissions:

All permissions of an "Employee".

Can view all requests from all employees in a central admin dashboard.

Can manually override (approve/reject) any pending request.

Can access the Rule Engine Editor to create, update, or delete the JSON-based business rules.

3. Core Feature Set (Epics)

F1: Authentication & Profile Management

Tech Stack: Supabase Auth, Next.js (Middleware)

Description:

Users log in via Supabase.

User sessions are managed securely (cookies).

A middleware.ts file in Next.js will protect all routes, redirecting unauthenticated users to a login page.

Role-based access is enforced. If an 'Employee' tries to access /admin, middleware will block them.

F2: Request Submission Form (Employee)

Tech Stack: Next.js (App Router), React Hook Form, Shadcn/UI, Tailwind CSS

Description:

A client-side rendered page ('use client') at /dashboard/request/new.

The form will be built using Shadcn/UI components (Input, Select, Button, Card).

All form state, validation (real-time, client-side), and submission handling will be managed by React Hook Form.

Validation rules: amount (must be a positive number), reason (must not be empty), type ('expense' or 'loan').

F3: Request Processing Engine (Backend Core)

Tech Stack: Next.js (Server Action), json-rules-engine, Supabase (DB)

Description: This is the core "backend mindset" feature.

The React Hook Form (F2) will trigger a Server Action (e.g., submitRequestAction) on submit.

The Server Action (running only on the server) will:
a.  Securely get the authenticated user_id from Supabase Auth.
b.  Re-validate the form data (server-side validation).
c.  Fetch the current active rules from the Supabase rules table.
d.  Construct a "fact" object based on the user and the request (e.g., { "amount": 500, "user_department": "engineering", "user_role": "employee" }).
e.  Initialize the json-rules-engine with the fetched rules.
f.  Execute engine.run(facts).
g.  Receive the result (e.g., { event: { type: 'auto-approve' } } or { event: { type: 'requires-admin-review' } }).
h.  Save the new request to the requests table in Supabase with the status determined by the engine.
i.  Use revalidatePath('/dashboard') to update the employee's dashboard in real-time.

F4: Dashboards (Employee & Admin)

Tech Stack: Next.js (App Router - RSC), Supabase (DB), Shadcn/UI

Description:

Employee Dashboard (/dashboard):

This will be a React Server Component (RSC).

It will await a Supabase query directly within the component to fetch the user's request history.

Data will be displayed in a Shadcn/UI Table.

Admin Dashboard (/admin/dashboard):

Also an RSC, but it queries all requests.

Includes filters and a "manual override" button (which calls another Server Action).

F5: Rule Engine Editor (Admin)

Tech Stack: Next.js (App Router), Server Action, Shadcn/UI

Description:

A protected admin-only page at /admin/rules.

Renders the current rules from the rules table.

Provides a simple UI (e.g., Textarea or a basic code editor) for Admins to edit the raw jsonb of the rules.

A "Save" button will trigger a Server Action (updateRulesAction) to update the rules in the Supabase DB. This demonstrates the "dynamic" nature of the system.

F6: Public API Endpoint (External Integration)

Tech Stack: Next.js (API Route)

Description: This feature exists to satisfy the JD's requirement of knowing both Server Actions and traditional API development.

An API endpoint will be created at app/api/requests/[id]/status/route.ts.

This endpoint is not for the web app (which uses Server Actions). It's for a hypothetical 3rd-party service (e.g., a Slack Bot, a mobile app).

It will require API Key authentication (checked in the route handler).

It will return the status of a specific request: GET /api/requests/123-abc/status -> { "status": "approved" }.

4. Technical Stack & Architecture

| Category | Technology | Reason (Mapping to JD) |
| Framework | Next.js 14+ (App Router) | Core requirement. We will use RSCs by default for performance and Server Components for data fetching. |
| UI Components | Shadcn/UI | Explicitly required. Provides unstyled, composable components. |
| Styling | Tailwind CSS | Required. Used by Shadcn/UI and for all custom styling. |
| Form Management | React Hook Form | Explicitly required. For performant, scalable form state and validation. |
| Backend Logic | Next.js Server Actions | Required. For all internal backend mutations (form submits, updates). |
| Backend API | Next.js API Routes | Required. For all external REST endpoints. Shows "Node/Express" mindset. |
| Business Logic | json-rules-engine | Explicitly required. To decouple complex business logic from the codebase. |
| Database | Supabase (Postgres DB) | Required. For all data storage (users, requests, rules). |
| Authentication | Supabase Auth | Required. For user login, session management, and RBAC (Row Level Security). |
| Deployment | Vercel | Required. For seamless, optimized CI/CD and hosting of the Next.js app. |
| Dev Environment | Cursor / AI-Powered IDE | Required. Team will be open to using AI tools to boost productivity. |

5. Database Schema (Supabase)

profiles (Managed by Supabase Auth trigger)

id (uuid, primary key, foreign key to auth.users.id)

email (text)

role (text, enum: employee or admin)

requests

id (uuid, primary key, default gen_random_uuid())

created_at (timestamp, default now())

user_id (uuid, foreign key to profiles.id)

type (text, enum: expense or loan)

amount (numeric)

reason (text)

status (text, enum: pending, approved, rejected)

rules (The Rule Engine definitions)

id (uuid, primary key, default gen_random_uuid())

name (text)

priority (int, for order of execution)

conditions (jsonb)

event (jsonb)

6. Out of Scope (For V1)

File attachments on requests (e.g., receipts).

Multi-stage approval chains (e.g., Employee -> Manager -> Finance).

Email/Slack notifications.

A visual "drag-and-drop" rule editor (Admins will edit the raw JSON).