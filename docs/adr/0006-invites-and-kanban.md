# ADR 0006: Shareable invites and RBAC Kanban

## Status

Accepted

## Context

Memberships were seeded in SQL or created only as the signup owner. There was no way to add a teammate from the product. Supabase `inviteUserByEmail` would send more auth mail and hit the free-tier rate limit. The Board was a status-chip table, not a column board, and status moves were not an explicit Kanban surface.

## Decision

1. **Invites are shareable links**, not emailed magic links. `invitations` stores email, role, token, expiry. Owners and admins create/revoke. Anon preview uses `get_invitation(token)` (`security definer`). Accept matches the signed-in email, then the server-only admin client inserts the membership (same chicken-egg as signup). Invitee signup skips `create_workspace`.
2. **Board is a Kanban.** `/dashboard` lists tickets in status columns. Owner, admin, and agent may move cards (`canTransitionStatus` + `TICKET_STATUS_FLOW`). Clients and viewers read and open cards. Writes still go through `updateTicketStatusAction`; Realtime only announces.

## Consequences

Hosted projects must apply `20260816030000_invitations.sql`. A user with no membership lands on `/join` instead of looping login ↔ dashboard. `getAppContext()` still uses the first membership; a second org from an invite has no switcher yet.
