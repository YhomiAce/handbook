---
title: 'ADR 0001: Modular monolith'
description: Why the API and worker are one deployable codebase with enforced module boundaries.
sidebar:
  order: 3
  label: 'ADR 0001: Modular monolith'
---

- **Status:** Accepted
- **Date:** 2025-02-11
- **Deciders:** Engineering leads

## Context

We are a team of nine engineers building one product. The early codebase grew without clear
boundaries: billing code reached into user tables directly, and a change in one area regularly broke
another. Several engineers proposed splitting the system into microservices (users, billing,
notifications, documents) to enforce boundaries.

Constraints:

- We have no dedicated platform team; the same engineers build features and run production.
- Most features touch two or three domains at once, and need transactional consistency between them (for example, creating an invoice and reserving credit).
- Our traffic (~150 requests/second at peak) fits comfortably on a few instances.

## Options considered

### Option A: Microservices, one per domain

- **Pros:** hard boundaries; independent deploys and scaling; teams could own services.
- **Cons:** distributed transactions or sagas for cross-domain features; network failures between services; one pipeline, dashboard set and on-call runbook per service; local development needs every service running. A large operational cost for a team our size.

### Option B: Keep the monolith as it is

- **Pros:** no migration work.
- **Cons:** doesn't address the coupling that's slowing us down.

### Option C: Modular monolith

One codebase and one deployable (run as `api` and `worker` processes), split into modules with
explicit public interfaces, and boundaries enforced by tooling.

- **Pros:** fixes the coupling problem; keeps in-process calls and database transactions; one thing to deploy and operate; a module can be extracted into a service later if it really needs to be.
- **Cons:** boundaries are enforced by lint rules rather than the network, so discipline is required; one deploy pipeline means one bad change can block others.

## Decision

We will structure the backend as a **modular monolith** (option C). Each domain is a module under
`src/modules/<name>` with a single `index.ts` that exports its public API. Modules may only import
from another module's `index.ts`; a lint rule (`import/no-restricted-paths`) fails CI otherwise.
Each module owns its tables; other modules access that data only through the owning module's API.

## Consequences

- Cross-domain features can use a single database transaction.
- We operate two process types from one image, which keeps the [deployment checklist](/operations/deployment-checklist/) and [rollback runbook](/operations/rollback/) simple.
- We must invest in the boundary lint rules and review module interfaces carefully in [code review](/practices/code-review/).
- **We'll revisit** if a module needs to scale very differently from the rest, if we grow to multiple teams that block each other on deploys, or if a module needs a different runtime.
