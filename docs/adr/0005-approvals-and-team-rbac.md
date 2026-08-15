# ADR 0005: Dedicated approvals board and team RBAC screen

## Status

Accepted

## Context

Approvals existed as rows, RLS, and a panel on ticket detail. Roles existed as `memberships.role`, `lib/auth/permissions.ts`, and policies. Neither had a first-class operate surface, so a reviewer had to open a ticket, and RBAC was a header label.

## Decision

Add `/approvals` as the organization-wide sign-off queue (filter by status, review inline for client/owner/admin). Add `/team` as the membership roster plus the published permission matrix. Role changes go through a server action (Zod, `canAssignRole`, last-owner guard) and still hit RLS on `memberships`.

## Consequences

The ticket workspace still shows approvals for that work order. The board is the place to scan every pending sign-off. Owners and admins change existing members' roles. Shareable invites are in ADR 0006.
