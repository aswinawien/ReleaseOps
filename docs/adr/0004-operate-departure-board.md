# ADR 0004: Operate UI as a departure board

## Status

Accepted

## Context

The first shell used cream paper, a serif display face, a tracked product kicker, and four equal hero-metric cards. That is the default AI-dashboard costume. It fights the product: agents scan a work queue under fluorescent office light, they do not browse a marketing page.

Impeccable new-work assigned grounded candidate 5 of 7 (seed `cee50420`, degraded roll, no challengers): railway timetable / departure board. Mode is Operate. Build path is code-led (no stored image-gen default).

## Decision

Replace the cream-serif SaaS look. Use cool fluorescent paper, a steel rail header, Barlow + Barlow Condensed, hairline tables, status chips with real counts, and an amber live lamp. Status is never color-only. Do not ship four equal metric cards or a tracked kicker above a heading.

Product behavior (auth, RLS, realtime, repositories) stays the same. Only the visual world and information hierarchy change.

## Consequences

The board is a table, not a card stack. Login is a station desk (rail + form), not a centered marketing card. DESIGN.md and [design-language.md](../design-language.md) record the system so later screens inherit it instead of drifting back to cream-serif.
