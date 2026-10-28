---
title: Code review guide
description: Why we review code, what reviewers look for and how to give and receive feedback.
sidebar:
  order: 1
---

Every change to `main` is reviewed by at least one other engineer. Review exists to **share knowledge
and catch problems early**, not to gatekeep. A good review is fast, specific and kind.

## For authors

### Keep pull requests small

Aim for under **400 changed lines**. Large PRs get skimmed, small ones get read. If a change is big,
split it: a refactor PR first, then the behaviour change. Feature flags let you merge incomplete work
safely.

### Write a description that stands on its own

Your reviewer shouldn't need to read the ticket to understand the PR. Use the template:

```md
## What
One or two sentences on what changes.

## Why
The problem this solves, with a link to the ticket.

## How to test
Steps a reviewer can follow, or "covered by tests in X".

## Risks
What could break, and how you'd notice (metrics, logs, alerts). Rollback plan if not trivial.
```

Include screenshots or a short recording for UI changes.

### Review your own diff first

Read the diff in GitHub before requesting review. You'll catch leftover debug logs, unrelated
formatting changes and missing tests, and save a round trip.

### Respond to every comment

Either change the code, or reply explaining why not. "Done" is a fine reply. Resolve threads only after
the reviewer is satisfied, or when the comment was explicitly optional.

## For reviewers

### Respond within one working day

A PR waiting for review is work in progress that can't ship. If you can't review in time, say so and
suggest someone else. Reviews take priority over starting new work.

### What to look for, in order

1. **Correctness.** Does it do what the description says? Edge cases: empty input, nulls, concurrency, time zones, retries.
2. **Design.** Does it fit the existing architecture? Is it in the right place? Will it be easy to change?
3. **Security.** Input validation at boundaries, authorization checks, secrets, injection. See [secrets handling](/security/secrets/).
4. **Tests.** Do they test behaviour rather than implementation? Would they fail if the code were wrong? See the [testing strategy](/practices/testing-strategy/).
5. **Operability.** Will we know if this breaks in production? Logs, metrics, error messages that help the on-call engineer.
6. **Readability.** Names, comments where the *why* isn't obvious, dead code.

Formatting and lint issues are the CI's job, not yours. If you find yourself commenting on style, add a
lint rule instead.

### Label your comments

Make it clear what's blocking and what isn't. We use these prefixes:

| Prefix        | Meaning                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `blocking:`   | Must be addressed before merge (bug, security issue, broken contract)   |
| `suggestion:` | Would improve the code; author decides                                  |
| `question:`   | You want to understand something; not a request to change it            |
| `nit:`        | Trivial; feel free to ignore                                            |
| `praise:`     | Something done well. Use it more than you think you should              |

### Be kind and specific

- Comment on the code, not the person: "this function does two things" rather than "you made this confusing".
- Explain the *why* behind a request, and suggest an alternative where you can.
- Ask, don't command, when you're not sure: "What happens if `items` is empty here?"
- Approve with comments when the remaining points are minor. Trust your teammates to address them.

## Approvals and merging

- One approval is required; two for changes to authentication, billing, data migrations or infrastructure.
- CI must be green. Don't merge over a red build "because the failure is unrelated": fix or quarantine the flaky test first.
- The **author** merges, using squash merge, so the PR title becomes the commit message. It must follow [Conventional Commits](/practices/branching-and-commits/#commit-messages).
- Merge when you're around to watch the deploy. Not on Friday afternoon.
