# ReleaseOps

Client portal and work-order management for a small agency or IT service team. Clients file requests. Agents assign, comment, and move status. Both sides see live updates over Supabase Realtime. The database remains the source of truth.

This is a portfolio project. All people, tickets, and brands in the seed data are synthetic (Harbor & Pine Studio).

## Screenshots

After `npm run dev`, capture:

1. `/login` — sign-in and workspace creation
2. `/dashboard` — counts derived from real ticket rows
3. `/tickets/[id]` — comments, activity, presence, and the connection banner

Place images in `docs/screenshots/` if you publish this repo. This README does not embed fabricated product photos.

## Demo credentials

Available after you apply `supabase/migrations` and `supabase/seed.sql`:

| Role | Email | Password |
| --- | --- | --- |
| owner | mira.owner@harborpine.test | HarborPine!demo1 |
| agent | jonas.agent@harborpine.test | HarborPine!demo1 |
| client | priya.client@harborpine.test | HarborPine!demo1 |
| viewer | owen.viewer@harborpine.test | HarborPine!demo1 |

Use two browsers to watch presence and comments land live.

## Setup

Requires Node 20.9+.

```bash
nvm use
cp .env.example .env.local
```

Create a free Supabase project. Paste the project URL and anon key into `.env.local`. Keep the service-role key server-only.

Apply schema and seed:

```bash
npx supabase db push
npx supabase db reset   # local CLI, includes seed.sql
```

On hosted Supabase, run the SQL files in `supabase/migrations/` then `supabase/seed.sql` in the SQL editor. Enable Realtime for `tickets`, `ticket_comments`, `approvals`, `activity_events`, and `notifications` if the publication statements did not apply.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture summary

- Next.js App Router with TypeScript strict mode (`noUncheckedIndexedAccess`)
- Tailwind CSS for a responsive, keyboard-accessible shell
- Supabase Auth cookies via `@supabase/ssr`
- Postgres + RLS for organization tenancy
- Server actions + Zod for writes
- Postgres Changes for durable live updates
- Private Broadcast/Presence for typing and viewers
- Jest for domain and merge logic; Playwright for auth pages

Details: [docs/architecture.md](docs/architecture.md), [docs/realtime.md](docs/realtime.md), [docs/security.md](docs/security.md).

## Testing

```bash
npm run lint
npm run type-check
npm test
npm run build
npx playwright install chromium   # once
npm run test:e2e
```

## Deployment

The app is a standard Next.js project. Deploy to Vercel (or any Node host that speaks the App Router). Set the same environment variables. Do not put `SUPABASE_SERVICE_ROLE_KEY` in client-visible settings.

No VPS, paid queue, or paid LLM is required.

## Limitations

- One membership per user is loaded (first created). Multi-org switching is not built.
- Email confirmation behavior depends on your Supabase project settings.
- Playwright does not log in against a live project in CI; that needs secrets and seed data.
- Search is title `ilike` only, not full-text.
- Storage uploads are not implemented yet.

## Future improvements

- Org switcher and invitations
- File attachments through Supabase Storage
- Saved views and fuller dashboard charts from real queries
- End-to-end Playwright covering create → assign → comment with a seeded preview project
