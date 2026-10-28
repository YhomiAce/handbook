---
title: Incident response runbook
description: Severity levels, roles, and step by step what to do when production breaks.
sidebar:
  order: 2
---

An **incident** is any unplanned event that degrades the service for users or puts data at risk.
When in doubt, declare one: it costs little to downgrade, and a lot to discover an outage late.

## Severity levels

| Severity | Definition | Examples | Response |
| --- | --- | --- | --- |
| **SEV-1** | Critical: the product is down or data is being lost or exposed, for many or all users | Site unreachable; checkout failing for everyone; data breach; data corruption | Page immediately, all hands as needed. Status page updated within **15 min**. Updates every **30 min**. Exec informed. |
| **SEV-2** | Major: a core feature is broken or badly degraded for a significant share of users, no workaround | Logins failing for one region; payments delayed > 30 min; error rate > 5% | Page on-call. Status page within **30 min**. Updates every **hour**. |
| **SEV-3** | Minor: a non-core feature is broken, or a core one is degraded with a workaround | CSV export failing; search slow but working; one customer's integration broken | Handle in working hours. No status page unless customers ask. |
| **SEV-4** | Cosmetic or internal-only, no real user impact | Typo in an email template; an internal admin page error | A normal ticket. Not an incident. |

Severity is about **impact**, not cause. It can change during the incident; say so in the channel when it does.

## Roles

For SEV-1 and SEV-2 these roles are separate people. For SEV-3 one person may hold all of them.

- **Incident commander (IC):** coordinates, decides, and keeps the big picture. Does *not* debug. Usually the on-call primary until they hand over.
- **Operations lead:** investigates and applies fixes. Can pull in other engineers.
- **Communications lead:** posts internal updates, updates the status page and talks to support and customers.
- **Scribe:** keeps a timeline in the incident channel (the IC can do this for smaller incidents).

## The first 15 minutes

1. **Declare.** In Slack run `/incident declare`, choose a severity and a short description of the *symptom*. This creates `#inc-YYYYMMDD-short-name`, pages the secondary, and posts in `#incidents`.
2. **Assign roles.** The person declaring is IC until they explicitly hand over: "Alex, you're IC now. Confirm?"
3. **Assess impact.** Who is affected, since when, how badly? Check the dashboards, error tracking and support queue.
4. **Communicate.** Post the first update (template below). For SEV-1/2, update the status page.
5. **Mitigate first, fix later.** Look for the fastest way to stop the impact:
   - Was there a deploy in the last few hours? **Roll it back** (see the [rollback runbook](/operations/rollback/)).
   - Was a feature flag recently changed? Turn it off.
   - Is one dependency failing? Fail over, or degrade gracefully.
   - Is it load? Scale up, or shed non-critical traffic.

## Running the incident

- Keep all discussion in the incident channel, so the timeline writes itself. Use a call for speed, but post decisions in the channel.
- The IC asks for updates every 15-30 minutes: "What do we know, what are we trying, what's next?"
- Announce every change to production *before* making it: "Rolling back api to v2026.03.09-2 now."
- If you've been at it for **an hour without progress**, escalate: pull in the owning team, a senior engineer, or a vendor.
- Rotate people out after a few hours. Tired people make mistakes.

## Communication templates

**Internal update** (in the incident channel and `#incidents`):

```md
**[SEV-2] Elevated checkout errors**: update 3, 14:45 UTC
Status: Mitigating
Impact: ~15% of checkout attempts fail with a 502, since 14:05 UTC
Current theory: connection pool exhaustion after the 13:58 api deploy
Actions: rolling back api to the previous release (ETA 14:55)
Next update: 15:15 UTC or sooner
IC: @alex | Ops: @sam | Comms: @jo
```

**Status page:**

> **Investigating:** Some customers are seeing errors when completing checkout. We're investigating
> and will update within 30 minutes.

Status page updates describe the impact in user terms. No internal jargon, no blame, no speculation on cause.

## Resolving

An incident is **resolved** when user impact has ended and the system is stable, even if the root
cause isn't fixed yet. Then:

1. The IC posts a final update and marks the incident resolved; the status page is updated.
2. Open follow-up tickets for anything urgent.
3. **SEV-1 and SEV-2 require a postmortem** within 5 working days, using the [postmortem template](/operations/postmortem-template/). SEV-3 gets one if there's something to learn.

## Security incidents

If you suspect a breach, leaked credentials or unauthorised access, **declare a SEV-1 and tell the
security lead directly**. Don't discuss details in public channels, and don't destroy evidence (don't
delete the compromised instance, snapshot it). Rotate leaked secrets right away following
[secrets handling](/security/secrets/#if-a-secret-leaks).
