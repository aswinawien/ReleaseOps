---
name: ReleaseOps
description: Operate work-order board in a railway timetable language.
colors:
  paper: "#e6eaef"
  board: "#f6f7f9"
  ink: "#14181f"
  ink-soft: "#3d4a58"
  sea: "#18586e"
  sea-dark: "#134556"
  signal: "#c05612"
  danger: "#b42318"
  line: "#c2c9d2"
  ok: "#1b6b48"
  rail: "#17202b"
  rail-ink: "#eef1f4"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  none: "0px"
  sm: "4px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  control: "44px"
components:
  button-primary:
    backgroundColor: "{colors.sea}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "{spacing.control}"
  button-primary-hover:
    backgroundColor: "{colors.sea-dark}"
    textColor: "#ffffff"
  button-secondary:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "{spacing.control}"
  button-rail:
    backgroundColor: "transparent"
    textColor: "{colors.rail-ink}"
    height: "{spacing.control}"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    height: "{spacing.control}"
  board-header:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-ink}"
---

# Design System: ReleaseOps

## Overview

**Creative North Star: "The departure board"**

ReleaseOps is a work-order desk, not a marketing site. The shipped world is a railway timetable: cool fluorescent paper, a steel rail header, hairline columns, Barlow for work and Barlow Condensed for titles. Agents scan rows, read stamps, and act. The live lamp reports the socket; Postgres remains the record.

This system was recorded after the operate overhaul (seed `cee50420`, grounded candidate 5, code-led). The previous cream + Source Serif + tracked kicker + four metric cards is evidence of what the product is, and the anti-reference for what it must not become again.

**Key Characteristics:**

- Restrained palette: neutrals plus steel `--sea` and amber `--signal`
- Dense tables over card stacks
- Status as labeled stamps, never color-only
- 44px controls, 150–250ms state motion
- Tabular numerals on ages and counts

## Colors

Cool office light. Paper is gray-blue. The rail is near-black steel. Accent is used for primary actions and current selection, not decoration.

### Primary
- **Steel sea** (`#18586e`): primary buttons, links, focus ring, text selection.

### Secondary
- **Lamp amber** (`#c05612`): live/unhealthy banner, unread, urgent support. Not a second brand color for chrome.

### Neutral
- **Paper** (`#e6eaef`): page ground
- **Board** (`#f6f7f9`): tables, panels, form wells
- **Ink** (`#14181f`): body text
- **Ink soft** (`#3d4a58`): secondary text, tinted from ink
- **Line** (`#c2c9d2`): hairline borders
- **Rail** (`#17202b`) / **Rail ink** (`#eef1f4`): header strip
- **Ok** (`#1b6b48`): resolved / live connected
- **Danger** (`#b42318`): errors and high/urgent stamps

### Named Rules
**The One Lamp Rule.** Amber is for live, unread, and urgent. It does not tint the page.

**The No Cream Rule.** Warm cream grounds and terracotta “craft” accents are out. Paper stays cool.

## Typography

**Display Font:** Barlow Condensed (600/700)
**Body Font:** Barlow (400/500/600/700)

**Character:** Condensed titles like a timetable header. Body is a workhorse sans at operate scale, not a display pairing for drama.

### Hierarchy
- **Display** (600, 2.25rem, line-height 1): page titles and ticket titles
- **Headline** (600, 1.5rem–2rem): section titles (Approvals, Comments)
- **Body** (400, 0.875rem): description, comments, helper copy; prose max ~70ch
- **Label** (500, 0.875rem): form labels, table headers, nav

### Named Rules
**The No Kicker Rule.** No tracked uppercase eyebrow above a heading. The heading carries its own weight.

**The Data Face Rule.** Buttons, labels, and table cells stay in Barlow. Condensed is for titles and the wordmark only.

## Layout

Max content width `max-w-6xl`. Standard shell: full-width steel top rail, then the board. Mobile collapses nav into a Menu disclosure on the rail. Spacing rhythm: tight groups (8–12px), section gaps 24px (`gap-6`). More space above a heading than below it.

The dashboard is a full-width status track (six bays, internal horizontal scroll when they cannot share the rail). Tickets stay the hairline queue table. Do not introduce a four-up metric card row.

## Elevation & Depth

Flat. Depth is a 1px `--line` border and a darker rail, not shadow. No zero-offset glow, no stacked cards with `shadow-sm`.

### Named Rules
**The Hairline Rule.** Declare elevation once: a border. Do not add a wide soft shadow under it.

## Shapes

Near-square. Tables and panels use 0 radius. Buttons use 4px (`rounded`). Status stamps are rectangular with a 1px border, not pills. Live indicators are 8px squares, not decorative dots in a vacuum — they sit next to a text label.

## Components

### Buttons
- **Shape:** 4px radius, min-height 44px, 16px horizontal padding, 200ms color transition
- **Primary:** `--sea` on white text; hover `--sea-dark`
- **Secondary:** board fill, ink text, 1px line
- **Ghost:** transparent, ink; hover white/80
- **Rail:** transparent on the header, rail-ink text; hover white/10
- **Danger:** `--danger` on white
- **Loading:** spinner + `aria-busy`; disabled at 50% opacity

### Chips
- Status chip nav: hairline board with rail fill on the current filter. Count uses tabular numerals.
- Status/priority badges: bordered stamps with a text label.

### Cards / Containers
- Board panels: `border border-line bg-board`, no large radius, padding 16–20px.
- Empty state: dashed line, centered title + recovery copy.

### Inputs / Fields
- White fill, 1px line, 0 radius, 44px height. Focus: 2px `--sea` outline, 2px offset. Error: `--danger` border + `role="alert"` message. Caret is `--sea`.

### Navigation
- Steel rail, 44px text links, current page `bg-white/10`. Alerts count is an amber stamp with a number. Mobile Menu expands the same links under the rail.

### Queue table (signature)
- Rail-colored header row, hairline row rules, hover white. Columns: work order (link + project), assignee, updated (tabular), status stamp, priority stamp.

## Do's and Don'ts

### Do:
- **Do** put real ticket counts on status chips and tabular ages on the board.
- **Do** keep status as words plus color.
- **Do** theme selection, caret, scrollbar, and focus from this palette.
- **Do** use skeletons for board loading, not a centered spinner as the page.

### Don't:
- **Don't** restore cream paper, serif display, or a tracked kicker.
- **Don't** ship four equal hero-metric cards.
- **Don't** use Broadcast or Presence as the ticket record.
- **Don't** invent performance claims or real client names.
- **Don't** use emoji as the icon system.
