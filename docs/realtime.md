# Realtime

The database is the source of truth. WebSockets announce that something durable changed, or carry ephemeral UI state that is allowed to vanish.

## Channel map

| Channel | Kind | Authorization | Payload |
| --- | --- | --- | --- |
| `ticket-db:{ticketId}` | Postgres Changes | Table RLS | Ticket, comments, activity, approvals |
| `ticket:{ticketId}` | Private Broadcast + Presence | `realtime.messages` policies | Typing, who is viewing |
| `org:{organizationId}` | Private Presence | `realtime.messages` policies | Workspace connection heartbeat |
| `user-db:{userId}` | Postgres Changes | `notifications.user_id = auth.uid()` | Inbox rows |

Private channels use `{ config: { private: true } }`. Policies on `realtime.messages` allow `ticket:{uuid}` only when the user is a member of that ticket's organization, and `org:{uuid}` only for a matching membership.

Postgres Changes still honor SELECT policies on `tickets`, `ticket_comments`, `approvals`, `activity_events`, and `notifications`. Replica identity is `FULL` so UPDATE/DELETE payloads include the row needed to merge or drop local state.

## What is durable vs ephemeral

Durable (must survive refresh):

- Ticket fields
- Comments
- Approvals
- Activity events
- Notifications

These are written with server actions or triggers. The socket handler merges the payload for snappy UI, then calls `router.refresh()` so Server Components re-read Postgres.

Ephemeral (may disappear on disconnect):

- Typing indicators (Broadcast, 2.5s TTL)
- "Currently viewing" (Presence)

A missed typing event is acceptable. A missed comment is not, which is why comments are rows, not broadcasts.

## Connection states

`lib/realtime/connection-state.ts` is a pure reducer:

`idle → connecting → connected`

After a drop: `disconnected → reconnecting → recovered → connected`

The banner is shown for `disconnected` and `reconnecting`. Copy tells the user that saves still go to the database. `navigator.onLine` is wired in as a second signal because a closed WebSocket and a dropped laptop lid are different failures.

## Trade-offs

**Merge then reconcile, not socket-as-store.** Applying `payload.new` keeps the thread feeling live. Relying on it alone would drift after a missed event or a partial payload. Refreshing from Postgres is slower and correct.

**Two channels per ticket.** Postgres Changes and private Presence/Broadcast have different authorization tables. Combining them on one channel is possible in some client versions and confusing in others. Splitting them keeps the failure mode obvious: presence can die while durable changes still arrive.

**Topic parsing in SQL.** Policies use `substr(realtime.topic(), 8)` for `ticket:` and `substr(..., 5)` for `org:`. That is brittle if we rename topics. The names are centralized in `lib/realtime/channels.ts` so the TypeScript side cannot drift silently; the SQL still has to be updated in a migration.

**No custom Realtime server.** Supabase's hosted free Realtime is enough for a portfolio demo. A paid queue or dedicated WebSocket VPS would add cost without changing the source-of-truth rule.

**Fan-out through triggers.** Assignment and comments insert notifications in the same transaction as the source row. The inbox channel then sees an INSERT. That is simpler than an application-level fan-out worker, and it stays inside the free Postgres quota.

## Tests

Jest covers the reducer, payload merge, typing parse, and presence filtering. Playwright covers the auth pages. Multi-browser presence still needs a seeded Supabase project and two demo users; that is a manual check listed in the README.
