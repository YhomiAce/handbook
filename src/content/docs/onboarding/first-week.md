---
title: Your first week
description: What to expect in your first five days and who to ask for help.
sidebar:
  order: 1
---

Welcome aboard. The goal of your first week is not to ship a big feature. It's to get set up, meet
people, understand how work flows through the team and **merge one small change to production**.

## Before day one

Your manager will have:

- opened an onboarding ticket with your name, start date and role
- requested your laptop and your Google Workspace account
- assigned you an **onboarding buddy**: an engineer who isn't your manager and whose job this week is to answer every "silly" question

## Day by day

### Day 1: Accounts and people

- Collect your laptop and sign in. Turn on full-disk encryption if it isn't on already.
- Work through the [access checklist](/onboarding/access-checklist/). Some approvals take a day, so start early.
- 30 minutes with your manager: expectations for the first 30/60/90 days.
- 30 minutes with your buddy: a tour of the codebase and the team's rituals.
- Join `#eng`, `#eng-deploys`, `#incidents` and your team's channel.

### Day 2: Dev environment

- Follow [dev environment setup](/onboarding/dev-environment/) until the test suite passes locally.
- Read the [system overview](/architecture/system-overview/) and the [ADRs](/architecture/adr-process/) linked from it.
- Skim [branching and commits](/practices/branching-and-commits/) and the [code review guide](/practices/code-review/).

### Day 3: Your first change

- Pick a ticket labelled `good-first-issue` from the board. Your buddy will help you choose.
- Open a pull request, even if it isn't finished. Draft PRs are a great way to ask questions.
- Review one PR from a teammate. You won't catch everything, and that's fine: reading code is the fastest way to learn it.

### Day 4: Ship it

- Get your PR approved and merged. Watch it go out in `#eng-deploys`.
- Read the [deployment checklist](/operations/deployment-checklist/) and the [rollback runbook](/operations/rollback/), so you know what happens when it goes wrong.

### Day 5: Operations and reflection

- Shadow whoever is on call for an hour. Read the [on-call guide](/operations/on-call/) first.
- Read two recent postmortems to see how we handle failure.
- 30-minute retro with your manager and buddy: what was confusing? **Fix one thing in this handbook** that tripped you up.

## Rituals you'll see

| Ritual          | When                 | What it's for                                          |
| --------------- | -------------------- | ------------------------------------------------------ |
| Stand-up        | Daily, 10:00, 15 min | Blockers and coordination, not status reports          |
| Planning        | Monday, every 2 weeks | Agree what we're trying to achieve in the next cycle  |
| Demo            | Friday, every 2 weeks | Show what shipped, to the whole company               |
| Incident review | Wednesday, weekly    | Walk through the week's postmortems and action items   |
| 1:1             | Weekly, 30 min       | Your time with your manager. You own the agenda       |

## Who to ask

- **Anything at all:** your buddy.
- **Access problems:** `#it-help`.
- **Something is broken in production:** `#incidents`, then follow the [incident runbook](/operations/incident-response/).
- **Security concern:** `#security`, or privately to the security lead. Never sit on it.
