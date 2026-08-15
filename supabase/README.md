# Seed data

`supabase/seed.sql` creates a fictional studio, **Harbor & Pine Studio**, with four demo people. There are no real employers, banks, or customer names.

The auth trigger `handle_new_user` creates `profiles` when `auth.users` rows are inserted. The seed then attaches memberships, projects, tickets, comments, and one pending approval.

Reset a local stack with:

```bash
npx supabase db reset
```

Hosted projects: run the migrations in the SQL editor (including `20260816010000_approvals_org_status_idx.sql`), then the seed. Confirm email for demo users is already set in the seed (`email_confirmed_at`).
