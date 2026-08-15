# Architecture

ReleaseOps is a Next.js App Router client portal for organization-scoped work orders. Postgres is the system of record. The UI is a typed, role-aware client over Supabase Auth, PostgreSQL, Row-Level Security, and Realtime. The socket never replaces a write.

This is a portfolio project. Seed people and tickets belong to the synthetic studio **Harbor & Pine Studio**. There are no real employers, banks, or clients in the schema or copy.

## Runtime shape

| Area | Responsibility |
| --- | --- |
| `app/` | Routes, layouts, loading/error/not-found. Server Components load durable state. |
| `features/` | User-facing flows: auth, tickets, comments, approvals, notifications, team invites, kanban, realtime hooks. |
| `components/` | Presentational UI: shell, queue table, badges, form primitives. No SQL. |
| `lib/repositories/` | Typed Supabase queries. The only place list/get SQL should live. |
| `lib/validations/` | Zod schemas shared by forms and server actions. |
| `lib/auth/permissions.ts` | Role matrix that must agree with RLS. Jest treats this as a contract. |
| `lib/realtime/` | Channel names, connection reducer, payload merge. |
| `lib/supabase/` | Browser, server, middleware, and `server-only` admin clients. |
| `supabase/migrations/` | Schema, triggers, RLS, Realtime publication. |

Server Components render the board from Postgres. Client Components own forms, presence, typing, and connection status. Server actions perform writes. Realtime announces.

`/approvals` is the org-wide sign-off queue (not only the panel on a ticket). `/team` is the membership roster, shareable invite links, and the published role matrix. Role changes go through `updateMembershipRoleAction`: Zod, `canAssignRole`, last-owner guard, then RLS on `memberships`. Invites go through `createInvitationAction` / `acceptInvitationAction`. `/dashboard` is a status Kanban; staff moves use `canTransitionStatus`.

## Request path

1. `middleware.ts` refreshes the Auth cookie via `@supabase/ssr` and calls `getUser()` so the JWT is checked with Auth, not only decoded on the edge.
2. Unauthenticated visits to `/dashboard`, `/tickets`, `/approvals`, `/team`, and `/notifications` redirect to `/login?next=...`. `/invite/{token}` stays public.
3. Authenticated visits to `/login` or `/signup` redirect to `/dashboard`, unless `next` is an `/invite/...` path.
4. `getAppContext()` loads the user, profile, first membership, and that organization. Missing profile or membership returns null. The app layout sends signed-in users with no membership to `/join` (not back to `/login`, which would loop).
5. Pages call repositories with the user-scoped server client. RLS is the last gate.

Every organization-owned row includes `organization_id`. Users only see rows for organizations where they have a membership.

## Writes

Mutations go through server actions, never through the socket:

1. Zod parse (`lib/validations/`)
2. Role check (`lib/auth/permissions.ts`)
3. Supabase query as the signed-in user (RLS still applies)
4. `revalidatePath` so the next Server Component render reads Postgres again

Activity events and notifications are inserted by **database triggers**, not by the app. A missed client insert cannot drop the audit trail.

`SUPABASE_SERVICE_ROLE_KEY` lives in `lib/supabase/admin.ts` behind `server-only`. Browser bundles never import it.

## Realtime

Three jobs, three channel kinds. Names are centralized in `lib/realtime/channels.ts`.

| Channel | Kind | What it carries |
| --- | --- | --- |
| `ticket-db:{ticketId}` | Postgres Changes | Ticket, comments, activity, approvals |
| `org-db:{organizationId}` | Postgres Changes | Ticket updates for the Kanban |
| `ticket:{ticketId}` | Private Broadcast + Presence | Typing, who is viewing |
| `org:{organizationId}` | Private Presence | Workspace connection heartbeat |
| `user-db:{userId}` | Postgres Changes | Notification rows for that user |

Durable facts (ticket fields, comments, approvals, activity, notifications) are rows. The client merges `payload.new` for snappy UI, then `router.refresh()` so Server Components re-read Postgres. Ephemeral facts (typing, viewers) may vanish on disconnect.

Connection state is a pure reducer in `lib/realtime/connection-state.ts`:

`idle → connecting → connected`

After a drop: `disconnected → reconnecting → recovered → connected`

The banner shows for `disconnected` and `reconnecting`. Copy states that ticket edits still save to the database.

See [realtime.md](./realtime.md) for authorization, replica identity, and trade-offs.

## Tenancy and authorization

RLS is enabled on every table. Policies call `is_org_member(organization_id)` or `has_org_role(...)` defined as `security definer` so membership lookups do not recurse.

Application checks fail closed in the UI. They are not a substitute for RLS. A crafted client can still hit PostgREST; it cannot read another organization's tickets if the policies hold.

Role matrix: [security.md](./security.md).

## Why this split

- SQL behind repositories keeps React components from growing query strings.
- One permission module makes Jest tests a contract for SQL policies.
- Triggers in Postgres mean history and inbox rows cannot be skipped by a forgetful action.
- Merge-then-refresh keeps the thread feeling live without treating the socket as a store.

## ADRs

- [0001 Feature folders on the App Router](./adr/0001-feature-based-app-router.md)
- [0002 RLS as the authorization backstop](./adr/0002-rls-authorization.md)
- [0003 Database as realtime source of truth](./adr/0003-realtime-source-of-truth.md)
- [0004 Operate UI as a departure board](./adr/0004-operate-departure-board.md)
