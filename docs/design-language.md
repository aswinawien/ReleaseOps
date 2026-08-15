# Design language

ReleaseOps is an **Operate** surface. Agents scan a queue and act. The visual world is a railway timetable / departure board (impeccable seed `cee50420`, grounded candidate 5, code-led, degraded roll). The old cream paper + serif display + tracked kicker + four metric cards is the anti-reference.

Longer token record: [DESIGN.md](../DESIGN.md). Product constraints: [PRODUCT.md](../PRODUCT.md).

## Scene

Cool fluorescent office light. Steel header strip. Paper that is gray-blue, not warm cream. Hairline rules. Tabular numerals. One accent for primary actions (steel/cobalt `--sea`), one lamp for live and urgent (amber `--signal`). Presence is a lamp, not a party.

## Type

One family, operate scale (~1.125–1.2 between steps):

- **Barlow** — body, labels, controls, table cells
- **Barlow Condensed** 600/700 — page titles and the wordmark

No Source Serif. No Inter / IBM Plex / Fraunces / Playfair / Space Grotesk / DM Sans as the display voice. Display type is not used on buttons, labels, or data.

Body measure for prose is ~65–75ch. Tables may run denser.

## What the first viewport must do

Dark rail: wordmark, primary nav, live lamp, user, sign out. **New ticket** is a steel primary control, not a floating FAB.

The board is a **table**: work order, assignee, updated, status, priority. Status chips above the table carry **real ticket counts**, not sample charts. There is no four-card hero-metric row.

Login is a station desk: steel rail on the left (large screens), form on the right. The heading is “Sign in”. There is no tracked uppercase kicker above it.

## Status

Status and priority are **stamps with text**. Color supports the label; it never replaces it. Urgent uses the amber lamp. Resolved uses green `--ok`.

## Motion

150–250ms on state (hover, loading, reconnect). No orchestrated page-load sequence. The live lamp changing color is the authored moment.

## Rejected on purpose

- Warm cream ground + high-contrast serif + terracotta “signal”
- Tracked eyebrow / kicker above a heading
- Four equal stat cards as the page structure
- Nested rounded-3xl card stacks
- Color-only status dots
- Purple SaaS gradients
- Treating Broadcast as the ticket record

## Accessibility floor

Visible `:focus-visible` ring in `--sea`. Control height 44px (`min-h-11`). Skip link to `#main-content`. Contrast on paper and on the rail. Screen readers hear status as words, not only as color.
