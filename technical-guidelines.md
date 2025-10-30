1. Project Overview & Philosophy

Project: Internal Approval System (IAS)
Document: Technical Guidelines & Standards
Goal: This document outlines the architectural principles, coding standards, and best practices all engineers must follow. The primary goal is long-term maintainability. We are not just building features; we are building a system that can evolve for years.

We prioritize Clarity > Brevity. Code is read far more often than it is written.

2. File & Directory Structure

While Next.js App Router provides the routing structure, how we organize our internal components and logic is critical.

2.1. Feature-Based Colocation (The "Module" Approach):

Instead of top-level /components, /lib, /hooks directories, we will group logic by feature.

Each route (e.g., /app/dashboard) will contain its own components, hooks, and logic.

Reasoning: This keeps related files together. When you work on the "request submission" feature, all the files you need (form.tsx, actions.ts, types.ts) are in one place (/app/dashboard/request/new/).

2.2. The _components Convention:

Reusable components specific to a route segment will live in a _components directory (e.g., /app/admin/dashboard/_components/data-table.tsx). The underscore signifies that this directory does not affect routing.

2.3. The src/ Directory:

All application code will reside within a src/ directory (i.e., src/app, src/lib, src/components).

2.4. Global Reusable Components (src/components):

This directory is reserved only for truly global, "dumb" UI components (e.g., Logo.tsx, SiteFooter.tsx).

Shadcn/UI components will be installed into src/components/ui.

If a component has business logic, it belongs in its feature module (see 2.1).

2.5. Server-Only & Client-Only Files:

All Server Actions for a feature will be colocated in an actions.ts file (e.g., src/app/dashboard/request/new/actions.ts).

All Server-side logic (e.g., direct DB calls) must be in files that are not imported by Client Components, or in files marked with 'use server'.

We will use the server-only and client-only packages to enforce boundaries at runtime.

3. Component Design & State Management

3.1. Server Components by Default:

Philosophy: "Push state to the leaves." Keep Client Components ('use client') as small and as far down the component tree as possible.

Implementation: Always create components as Server Components first. Only add 'use client' when you need hooks (useState, useEffect) or browser-only APIs.

Pattern: Use Server Components to fetch data and pass it as props to "dumb" Client Components. This is the "Server-Component-as-a-Shell" pattern.

3.2. State Management Strategy (Hierarchy of State):

Local State (useState): Use for simple, non-shared UI state (e.g., "is modal open?").

URL State (Next.js useRouter / useSearchParams): Use for state that should be bookmarkable (e.g., filters, current page, sort order on a table). This is the preferred method for managing dashboard/filter state.

Global State (Zustand): We will use Zustand (not Context) for any complex, global client-side state (e.g., logged-in user profile, shopping cart).

No Redux.

Avoid React Context API for state: It triggers unnecessary re-renders. Use Context only for simple dependency injection (e.g., theme).

3.3. Reusable Components (Shadcn/UI Based):

When a new "pattern" emerges (e.g., a "Form Field with Label and Error"), we will create a reusable component (e.g., FormField.tsx) based on Shadcn primitives.

These components must be fully type-safe and "dumb" (no internal business logic).

4. Backend & Data Logic (The "Senior" Part)

4.1. Server Actions: The Default for Mutations:

All internal form submissions and data changes must use Server Actions.

Security: Always re-validate data and check user permissions inside the Server Action. Never trust the client.

Error Handling: Server Actions must not throw raw errors. They should always return a structured response (e.g., { success: true, data: ... } or { success: false, error: "Message" }). We will use react-hook-form's form.setError() to display these errors on the client.

4.2. API Routes: For External Consumers Only:

API Routes (app/api/...) are only for the use case defined in requirements.md (F6): third-party integrations.

All internal web app data flow will use Server Actions.

4.3. Database Access (Supabase):

No Raw SQL in Components: All direct Supabase queries (await supabase...) must happen in Server Components or Server Actions.

Row Level Security (RLS): RLS must be enabled on all tables. Our application logic is the first line of defense, but RLS is the non-negotiable last line.

Data Layer (Future): For complex, reused queries, we will create a "data layer" (e.g., src/lib/data/requests.ts) containing functions like getRequestById(id), but this is deferred until V2.

5. TypeScript & Code Quality

5.1. Strict Mode: Enabled.

"noImplicitAny": true and "strictNullChecks": true are mandatory.

Do not use any. Use unknown if a type is truly unknown and parse it safely (e.g., with Zod).

5.2. types vs. interfaces:

Use type for all definitions (application state, props, etc.).

Use interface only when you need declaration merging (rarely, e.g., extending a 3rd-party library).

5.3. Zod for Validation:

We will use Zod for all data validation.

Define a Zod schema for all Server Action inputs and all API Route inputs. This is our primary defense against bad data.

Use z.infer<typeof mySchema> to automatically derive TypeScript types from our schemas. This ensures validation and types are never out of sync.

5.4. actions.ts Return Types:

Define a specific type for the return value of every Server Action to be consumed by the client (e.g., type FormState = { success: boolean; error?: string }).

6. Out of Scope (For Now)

Monorepo (e.g., Turborepo).

Testing (e.g., Jest, Playwright). This is a critical omission and will be the first thing added post-V1.

Storybook.