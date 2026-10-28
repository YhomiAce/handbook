---
title: ADR process
description: How and when we record architecture decisions, with a template.
sidebar:
  order: 2
---

An **Architecture Decision Record (ADR)** is a short document that captures one significant decision:
the context, the options we considered, what we chose and the consequences. ADRs answer the question
every new engineer eventually asks: *"why on earth is it built like this?"*

## When to write one

Write an ADR when a decision is **hard to reverse** or **affects more than one team**. For example:

- choosing a language, framework, database or major library
- introducing a new service, or merging existing ones
- changing how services communicate (sync vs async, a new protocol)
- cross-cutting conventions: authentication, error handling, API versioning
- deliberately accepting a known limitation or piece of technical debt

You don't need an ADR for decisions that are easy to change or local to one module. If you're unsure,
write a short one: they're cheap.

## Lifecycle

```text
Proposed  →  Accepted  →  (later) Superseded by ADR-NNNN  or  Deprecated
     ↘ Rejected
```

1. Copy the template below into `docs/adr/NNNN-short-title.md` with the next free number.
2. Open a PR with status **Proposed**. Share it in `#eng-architecture`.
3. Discussion happens in the PR. Give people at least **3 working days** for decisions that affect other teams.
4. When there's consensus (or the tech lead makes the call), set the status to **Accepted** and merge.
5. ADRs are **immutable** once accepted. If a decision changes, write a new ADR that supersedes the old one, and update only the old one's status line.

Rejected proposals are merged too, with status **Rejected**, so that the reasoning isn't lost.

## Template

```md
# NNNN. <Decision title, as a short noun phrase>

- **Status:** Proposed | Accepted | Rejected | Deprecated | Superseded by [NNNN](NNNN-title.md)
- **Date:** YYYY-MM-DD
- **Deciders:** <names or team>

## Context

What's the problem? What forces are at play: requirements, constraints, team skills, deadlines?
State facts, not the solution.

## Options considered

### Option A: <name>
Pros, cons, rough cost.

### Option B: <name>
Pros, cons, rough cost.

## Decision

We will <do X>. One paragraph, active voice.

## Consequences

What becomes easier, what becomes harder, and what we'll need to do because of this decision.
Include the conditions under which we'd revisit it.
```

## Our ADRs

- [ADR 0001: A modular monolith instead of microservices](/architecture/adr/0001-modular-monolith/)
- [ADR 0002: A Postgres-backed job queue](/architecture/adr/0002-postgres-backed-job-queue/)
