---
title: Postmortem template
description: A blameless template for writing up incidents, with guidance for each section.
sidebar:
  order: 3
---

We write postmortems to **learn**, not to assign blame. People make mistakes because systems let them;
the question is always *what made this possible?*, never *who did it?*. Name systems and decisions,
not individuals.

Postmortems are required for SEV-1 and SEV-2 incidents (see [severity levels](/operations/incident-response/#severity-levels)),
due within 5 working days, and reviewed in the weekly incident review.

## How to write one

- The incident commander owns the postmortem, and may delegate the writing.
- Start from the incident channel's timeline. Gather graphs and links while they're still available: dashboards expire.
- Ask "why?" until you reach something you can change. Stop when the answers stop being actionable.
- Keep action items few, specific and owned. Five done items beat twenty abandoned ones.

## The template

Copy everything below into a new doc in the **Postmortems** folder, named `YYYY-MM-DD short title`.

```md
# Postmortem: <short title>

| | |
| --- | --- |
| **Date** | 2026-03-09 |
| **Severity** | SEV-2 |
| **Duration** | 14:05 – 14:58 UTC (53 minutes of user impact) |
| **Incident commander** | <name> |
| **Author(s)** | <names> |
| **Status** | Draft / In review / Final |

## Summary

Two or three sentences a non-engineer can understand: what happened, who was affected and how it
was resolved.

## Impact

- Users affected: number or percentage, which segment
- Duration of impact
- Business impact: failed orders, SLA credits, support tickets
- Data impact: was any data lost, corrupted or exposed?

## Timeline (UTC)

| Time  | Event |
| ----- | ----- |
| 13:58 | api release v2026.03.09-3 deployed |
| 14:05 | Checkout error rate rises to 15% (first user impact) |
| 14:12 | "Checkout 5xx > 2%" alert pages on-call |
| 14:16 | Incident declared, SEV-2 |
| 14:41 | Rollback started |
| 14:58 | Error rate back to baseline; incident resolved |

## Root cause and contributing factors

What happened, technically, and *why* it was possible. Usually there are several contributing
factors: a change, a missing safeguard, a gap in testing or monitoring.

## Detection

How did we find out? How long between impact and detection? Could we have detected it sooner?

## Response

What went well, and what slowed us down? (Access, tooling, runbooks, communication.)

## What went well

-

## What went poorly

-

## Where we got lucky

-

## Action items

| Action | Type | Owner | Ticket | Due |
| ------ | ---- | ----- | ------ | --- |
| Add pool saturation alert | Detect | <name> | ENG-520 | 2026-03-20 |
| Load test connection pool settings in staging | Prevent | <name> | ENG-521 | 2026-03-27 |
| Make rollback a one-click action | Mitigate | <name> | ENG-522 | 2026-04-03 |
```

## Action item types

- **Prevent:** stop this class of problem from happening again.
- **Detect:** find out sooner (alerts, monitoring, synthetic checks).
- **Mitigate:** reduce the impact or speed up recovery next time (runbooks, rollbacks, feature flags).
- **Process:** change how we work (review requirements, checklists like the [deployment checklist](/operations/deployment-checklist/)).

## Reviewing

In the weekly incident review, the author walks through the postmortem in 10-15 minutes. Reviewers
check that the root cause analysis goes deep enough, that action items address it, and that the
language is blameless. Once reviewed, the status changes to **Final** and the doc is shared in `#eng`.
