# ADR 0001: Feature folders on the App Router

## Status

Accepted

## Context

The product mixes routing, forms, and domain rules. A file-type dump (`hooks/`, `utils/`, `views/`) would scatter ticket behavior across the tree.

## Decision

Keep Next.js routes in `app/`. Keep user-facing flows in `features/`. Keep database access in `lib/repositories/` and validation in `lib/validations/`.

## Consequences

Route files stay thin. Features can be tested around actions and schemas without mounting the whole App Router. The cost is a bit more import depth.
