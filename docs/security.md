# Security

## Keys

The browser only receives `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `SUPABASE_SERVICE_ROLE_KEY` is read in `lib/supabase/admin.ts`, which imports `server-only`. No client component imports that module.

## Row-Level Security

Every organization-owned table enables RLS. Policies call `is_org_member(organization_id)` or `has_org_role(organization_id, roles)` defined as `security definer` functions. That avoids recursive policy evaluation on `memberships`.

Application role checks in `lib/auth/permissions.ts` fail closed in the UI. They are not a substitute for RLS. A crafted client can still hit PostgREST; it cannot read another organization's tickets if the policies hold.

## Role matrix

| Action | owner | admin | agent | client | viewer |
| --- | --- | --- | --- | --- | --- |
| Read org tickets | yes | yes | yes | yes | yes |
| Create ticket | yes | yes | yes | yes | no |
| Assign / status / priority | yes | yes | yes | no | no |
| Comment | yes | yes | yes | yes | no |
| Request approval | yes | yes | yes | no | no |
| Review approval | yes | yes | no | yes | no |

## Realtime authorization

Private Broadcast and Presence use policies on `realtime.messages`. A user cannot subscribe to `ticket:{id}` unless they can see that ticket's organization. Notification changes are filtered by `user_id=eq.{auth.uid()}`.

## Session handling

`@supabase/ssr` stores the session in cookies. Middleware calls `getUser()` so the JWT is validated with the Auth server, not only decoded on the edge. Auth routes bounce signed-in users to `/dashboard`.

## What this does not claim

This is a portfolio project with synthetic Harbor & Pine Studio data. It is not a SOC 2 report, a pentest, or a production tenancy audit. RLS is necessary and tested by policy design plus unit tests on the TypeScript permission matrix; live policy tests need a seeded Supabase instance.
