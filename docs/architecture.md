# Architecture

ReleaseOps is a Next.js App Router client portal. The database is the system of record. The UI is a typed, role-aware client over Supabase Auth, Postgres, RLS, and Realtime.

## Runtime shape

- `app/` route handlers and server-rendered pages
- `features/` user-facing flows (auth, tickets, comments, approvals, notifications, realtime)
- `lib/repositories/` typed database access
- `lib/validations/` Zod schemas used by both UI and server actions
- `lib/auth/permissions.ts` role checks that must agree with RLS
- `supabase/migrations/` schema, triggers, and policies

Server Components load durable state. Client Components own forms, presence, typing, and socket status. Server actions perform writes. Realtime never writes.

## Auth and tenancy

`middleware.ts` refreshes the Supabase cookie session and sends anonymous users away from `/dashboard`, `/tickets`, and `/notifications`.

After login, `getAppContext()` loads the user profile, the first membership, and that organization. Every organization-owned row includes `organization_id`. RLS helper functions `is_org_member` and `has_org_role` are `security definer` so policy checks do not recurse.

## Writes

Mutations go through server actions:

1. Zod parse
2. Role check in application code
3. Supabase query as the signed-in user (RLS is the last gate)
4. `revalidatePath` so the next render reads Postgres again

Activity events and notifications are created by database triggers. That keeps the audit trail honest if a client forgets to insert them.

## Why this split

Putting SQL behind repositories keeps React components from growing query strings. Putting permissions in one module makes the Jest tests a contract for the policies in SQL. Putting triggers in Postgres means a missed application insert cannot silently drop history.

See [realtime.md](./realtime.md) and [security.md](./security.md) for the socket and RLS details.
