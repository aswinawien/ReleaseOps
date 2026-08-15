# ADR 0002: RLS as the authorization backstop

## Status

Accepted

## Context

A Next.js server action can enforce roles, but any anon key holder can call PostgREST directly. Organization data must not leak because a UI check was skipped.

## Decision

Enable RLS on every table. Scope all org data with `organization_id`. Use `security definer` helpers for membership lookups. Mirror the same role matrix in TypeScript for UX, not as the only control.

## Consequences

Policies are the contract. Changing a role requires a migration and a permission-module change. Queries that forget `organization_id` still fail closed for other tenants.
