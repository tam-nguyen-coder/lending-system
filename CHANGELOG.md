# Changelog

All notable changes to the Internal Approval System project.

## [1.0.0] - 2024

### Added
- Initial project setup with Next.js 16
- Authentication system using Supabase Auth
- Role-based access control (Employee/Admin)
- Request submission and management
- Dynamic rule engine using json-rules-engine
- Admin dashboard for managing all requests
- Rule editor for business logic configuration
- Public API endpoint for external integrations
- Comprehensive documentation (README, SETUP)

### Fixed
- **Authentication Session Persistence**: Fixed by implementing `@supabase/ssr` package for proper Next.js 16 compatibility
  - Updated client to use `createBrowserClient` from `@supabase/ssr`
  - Updated server to use `createServerClient` from `@supabase/ssr`
  - Proper cookie handling for session management
- Middleware renamed to proxy for Next.js 16 compliance
- Zod type definitions converted to JSDoc for JavaScript compatibility

### Changed
- Default export function in proxy.js renamed from `middleware` to `proxy`
- Improved error handling in Server Actions
- Enhanced documentation with troubleshooting guides

### Technical Stack
- Next.js 16+ (App Router)
- Supabase (Authentication & Database)
- Shadcn/UI components
- React Hook Form
- Zod validation
- Tailwind CSS
- json-rules-engine

