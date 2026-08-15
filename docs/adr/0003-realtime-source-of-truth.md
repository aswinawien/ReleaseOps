# ADR 0003: Database as realtime source of truth

## Status

Accepted

## Context

It is tempting to treat Broadcast as a chat bus and skip inserting comments. That breaks refresh, search, and any client that missed the socket.

## Decision

Write durable facts to Postgres. Use Postgres Changes to notify listeners. Use Broadcast and Presence only for typing and "who is viewing". After a change event, merge locally and reconcile with a server render.

## Consequences

UI code is slightly more complex. History, notifications, and RLS stay one system. Disconnects degrade presence, not the ticket record.
