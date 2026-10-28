---
title: On-call guide
description: How the rotation works, what's expected of you and how to hand over.
sidebar:
  order: 1
---

On-call means you're the first responder for production alerts outside working hours, and the
point person for operational issues during them. It's a shared responsibility: everyone who ships to
production takes part once they've completed onboarding.

## The rotation

- **Shifts are one week**, Monday 10:00 to Monday 10:00 local time, with a primary and a secondary.
- The **secondary** is paged if the primary doesn't acknowledge within 10 minutes, and is the first person to pull in for help.
- New engineers do **two shadow shifts** (paged alongside the primary, but not responsible) before their first primary shift.
- Swaps are fine. Arrange them with a teammate, update the schedule in PagerDuty yourself, and post in `#on-call`.

## What's expected

| | Expectation |
| --- | --- |
| Acknowledge a page | Within **10 minutes**, day or night |
| Start working on it | Within **20 minutes** of the page |
| Be reachable | Laptop and internet within reach; no flights, no being unreachable for long stretches |
| Don't be a hero | Escalate early. Paging someone who turns out not to be needed is fine; a long silent outage isn't |

You're **not** expected to fix everything yourself. Your job is to stop the bleeding (mitigate),
communicate, and pull in the right people.

## When you get paged

1. **Acknowledge** the page so the secondary isn't woken up.
2. **Assess**: open the alert's linked dashboard and runbook. Is it real? Are users affected?
3. If users are affected, **declare an incident** and follow the [incident response runbook](/operations/incident-response/).
4. If it's a false alarm or a non-urgent issue, resolve the page, and open a ticket to fix the alert or the underlying problem. An alert that doesn't need action should not page.

## Compensation and wellbeing

- Each on-call week earns a flat on-call allowance, plus time off in lieu for any page handled between 22:00 and 07:00.
- If you were up at night, start late the next day. Nobody needs to ask permission.
- If your rotation pages more than **twice a week out of hours** on average, that's a signal: the team prioritises alert and reliability fixes in the next cycle.

## Handover

At the end of your shift, post a handover in `#on-call` and tag the next primary:

```md
**On-call handover: week of 2026-03-09**
- Pages: 3 (2 actionable, 1 noisy; ENG-511 opened to tune the disk alert)
- Incidents: 1 SEV-3 (search latency, postmortem in progress)
- Ongoing: payments provider reports degraded webhooks, watching #vendor-status
- Heads-up: big migration scheduled Thursday 14:00 by the billing team
```

## Alerts we care about

Every paging alert must have:

- a clear summary that says **what's wrong for users**, not just which metric crossed a line
- a link to a dashboard
- a link to a runbook (even a short one) with first steps

If an alert pages you without these, fixing it is a legitimate task for your on-call week. Quiet time
on call is for operational improvements: tuning alerts, writing runbooks, fixing flaky tests.
