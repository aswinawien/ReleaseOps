# AGENTS.md

## Project

Build **ReleaseOps**, a portfolio-quality client portal and work-order management platform for small agencies and IT service teams.

The product allows clients to submit requests, teams to manage work, and both sides to collaborate in realtime.

## Goals

Show senior engineering ability through:

- Scalable frontend architecture
- TypeScript quality
- Authentication and authorization
- PostgreSQL data modeling
- Row-Level Security
- Realtime WebSocket behavior
- Testing and CI
- Accessibility and responsive UX
- Performance and error handling
- Clear technical documentation

This is a portfolio project using synthetic data only. Never mention or include real employers, banks, clients, credentials, or confidential information.

## Stack

- Next.js App Router
- TypeScript with strict mode
- React
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage, and Realtime
- Jest and React Testing Library
- Playwright for critical end-to-end flows
- ESLint and Prettier
- Vercel-compatible deployment
- No VPS or paid infrastructure required

## Core entities

Use database migrations for:

- organizations
- profiles
- memberships
- projects
- tickets
- ticket_comments
- approvals
- activity_events
- notifications

Every organization-owned record must include `organization_id`.

## Roles

Support:

- owner
- admin
- agent
- client
- viewer

Users must only access data belonging to organizations where they have membership.

Never expose the Supabase service-role key in browser code.

## Realtime design

Use Supabase Realtime over WebSockets:

- Postgres Changes for durable ticket and approval updates
- Broadcast for typing indicators and ephemeral UI events
- Presence for users currently viewing a ticket
- Private channels with authorization
- Clear loading, disconnected, reconnecting, and recovered states

The database is always the source of truth. Realtime events must not replace database writes.

## Product features

Build these in priority order:

1. Authentication
2. Organization and role-based access
3. Ticket creation and assignment
4. Ticket detail view
5. Comments and activity timeline
6. Status and priority changes
7. Approval and revision workflow
8. Realtime notifications
9. Presence and typing indicators
10. Search, filtering, pagination, and dashboard metrics

## Architecture

Prefer feature-based organization:

- `app/`
- `components/`
- `features/`
- `lib/`
- `lib/supabase/`
- `supabase/migrations/`
- `tests/`
- `e2e/`
- `docs/`

Keep business logic out of UI components. Use typed service/repository functions for database access.

## Quality rules

Every meaningful feature must include:

- Loading state
- Empty state
- Error state
- Accessible keyboard behavior
- Responsive layout
- Type-safe validation
- Tests for important behavior

Use realistic synthetic seed data. Do not create fake performance claims.

## Documentation

Maintain:

- `README.md`
- `docs/architecture.md`
- `docs/realtime.md`
- `docs/security.md`
- `docs/adr/`
- `docs/progress.md`
- `.env.example`

The README must include setup instructions, screenshots, demo credentials if applicable, architecture summary, testing commands, deployment instructions, limitations, and future improvements.

## Free infrastructure rule

Do not require:

- VPS
- Paid database
- Paid queue
- Paid LLM API
- Private infrastructure

If AI functionality is added, create a provider interface with a deterministic mock provider by default. A paid provider may be optional through an environment variable.

## Development workflow

Work in small vertical slices.

Before changing code:

1. Inspect the repository.
2. Read this file.
3. Create or update `docs/progress.md`.
4. Explain the implementation plan briefly.
5. Implement the smallest useful slice.
6. Run lint, type-check, tests, and build.
7. Fix failures before moving on.
8. Summarize changed files and remaining work.

Do not generate the entire application in one uncontrolled pass.

## Definition of done

The project is complete when:

- A new user can sign up and sign in
- A user can access only their organization’s data
- A client can create a ticket
- An agent can update and assign it
- Comments and activity history work
- Another browser sees realtime changes
- Presence and typing indicators work
- Critical flows have automated tests
- The app has a polished responsive UI
- The README explains the engineering decisions
- The project can deploy without a VPS
