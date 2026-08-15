# ReleaseOps progress

## Quality gate (2026-08-16, invites + Kanban)

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run type-check` | Pass |
| `npm test` | Pass — 6 suites, 26 tests |
| `npm run build` | Pass — `/invite/[token]`, `/join`, `/dashboard` Kanban |

## Invites + RBAC Kanban

Team could change roles but could not add anyone. Board was a ticket table.

- `/team` creates shareable invite links (email + role). No extra auth email. Copy `/invite/{token}`. Owners/admins revoke. Admins cannot invite owner.
- `/invite/{token}` is public. Preview via `get_invitation`. Accept matches signed-in email; admin client inserts membership.
- Invitee signup skips `create_workspace`. Middleware keeps `next=/invite/...`. Signed-in users with no membership go to `/join`.
- `/dashboard` is a full-width status Kanban (internal horizontal scroll). Owner/admin/agent move cards (`canTransitionStatus`). Clients/viewers read-only. Moves are server actions, not SSE; `org-db` Postgres Changes refresh other browsers.
- Hosted projects must run `supabase/migrations/20260816030000_invitations.sql`.
- Public git ignores `.env`, `.agents/`, `.impeccable/`, and `skills-lock.json`. CI deploys `main` to Vercel after verify.

## Quality gate (2026-08-16, UI overhaul + docs)

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run type-check` | Pass |
| `npm test` | Pass — 6 suites, 20 tests |
| `npm run build` | Pass — Next.js 15.5.23 |
| Impeccable `detect.mjs --json` on `app`, `components`, `features/*` | `[]` (no findings) |
| Direction contract seed `cee50420` | Present in production `.next` output |

Node 20.20.2. Playwright auth specs were not re-run in this gate.

## UI overhaul (Operate / departure board)

Replaced cream + serif + metric-card SaaS chrome with a railway timetable language (impeccable seed `cee50420`, grounded candidate 5, code-led, degraded roll, no challengers). Auth, RLS, and realtime logic were not redesigned.

- Cool paper, steel rail header, Barlow + Barlow Condensed
- Board = status chips with real counts + hairline table
- Login/signup = station desk (rail + form), no tracked kicker
- Screenshots in `docs/screenshots/` and `.impeccable/review/`

Documenter ran inline from the degraded documenter (no `impeccable-documenter` subagent in this harness). Finish review likewise inline: **ship** the operate world; remaining visual debt is mobile table overflow and the live lamp often still reading “Connecting” in captures.

## Docs shipped this pass

- `docs/architecture.md` expanded
- `docs/adr/0004-operate-departure-board.md`
- `docs/design-language.md`
- `DESIGN.md` + `.impeccable/design.json`
- `README.md` with real screenshots

## Earlier (2026-08-15)

Phase 0–1 (auth, schema, RLS), Phase 2 (tickets, comments, activity, approvals), realtime (Postgres Changes, Broadcast, Presence).

## Quality gate (2026-08-16, approvals board + Team RBAC)

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run type-check` | Pass |
| `npm test` | Pass — 6 suites, 25 tests |
| `npm run build` | Pass — `/approvals` and `/team` routes present |
| Impeccable `detect.mjs --json` on new UI | `[]` |

## Approvals board + Team RBAC

Approvals lived only on ticket detail. Roles lived in RLS/`permissions.ts` with no roster screen.

- `/approvals` — org-wide queue, status chips with real counts, inline review for client/owner/admin
- `/team` — membership roster, published permission matrix, role changes for owner/admin
- Guards: cannot change your own role; last owner stays locked; admins cannot grant or edit owner
- Nav + middleware protect both routes; pending approval count on Approvals
- Screenshots: `docs/screenshots/approvals-*.png`, `docs/screenshots/team-*.png`
- Index migration `supabase/migrations/20260816010000_approvals_org_status_idx.sql` (run on hosted projects)

## Remaining work (product)

- Org switcher (invite into a second org does not switch the session)
- Supabase Storage for ticket files
- Playwright create → assign → comment against a seeded preview
- Horizontal Kanban on very narrow phones
- Restart `npm run dev` if a production `next start` shared `.next` with the dev server (CSS/JS 404s)
- Apply `20260816030000_invitations.sql` on hosted Supabase if Team invite insert fails

Do not start a paid queue, VPS, or LLM for those items.
