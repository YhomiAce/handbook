---
title: Branching and commits
description: Trunk-based development, branch naming and Conventional Commits.
sidebar:
  order: 2
---

We use **trunk-based development**: `main` is always deployable, branches are short-lived (ideally
less than two days) and every merge to `main` is deployed automatically.

## Branches

- Branch from the latest `main`. Rebase on `main` rather than merging `main` into your branch.
- Name branches `<type>/<ticket>-<short-description>`, using the same types as commits:

```text
feat/ENG-412-invoice-pdf-export
fix/ENG-430-timezone-in-reminders
chore/bump-node-22
```

- Delete the branch after merging (GitHub does this automatically).
- No long-lived feature or release branches. Unfinished work is merged behind a **feature flag**.

## Commit messages

We follow [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/). Because we
squash-merge, the **PR title** becomes the commit on `main`, so that's where the format matters most.
CI checks PR titles.

```text
<type>(<optional scope>): <description>

<optional body: what and why, wrapped at 72 characters>

<optional footer(s)>
```

### Types

| Type       | Use it for                                                    | Release impact |
| ---------- | ------------------------------------------------------------- | -------------- |
| `feat`     | A new user-facing feature                                     | minor          |
| `fix`      | A bug fix                                                     | patch          |
| `perf`     | A performance improvement                                     | patch          |
| `refactor` | Code change that neither fixes a bug nor adds a feature       | none           |
| `test`     | Adding or fixing tests                                        | none           |
| `docs`     | Documentation only                                            | none           |
| `build`    | Build system, dependencies                                    | none           |
| `ci`       | CI configuration                                              | none           |
| `chore`    | Anything else that doesn't touch production code              | none           |
| `revert`   | Reverts a previous commit                                     | depends        |

### Breaking changes

Add `!` after the type/scope **and** a `BREAKING CHANGE:` footer that explains the migration:

```text
feat(api)!: require an Idempotency-Key header on POST /payments

BREAKING CHANGE: clients must send a unique Idempotency-Key with every
payment request. Requests without one now return 400. See the API design
guidelines for how keys are scoped.
```

### Good and bad examples

```text
✅ fix(billing): round invoice totals half-even to match the ledger
✅ feat(web): let admins export the audit log as CSV
✅ refactor(api): extract pagination cursor encoding into a helper

❌ fixed stuff                 (no type, says nothing)
❌ feat: Updates.              (vague, capitalised, trailing period)
❌ fix(api): fix bug in api    (repeats itself; which bug?)
```

Write the description in the imperative mood, lower case, without a trailing full stop: "add", not
"added" or "adds". A useful test: *"If applied, this commit will ___."*

## Tags and releases

Services deploy continuously and don't need version numbers. **Libraries and public SDKs** are released
from `main` with semantic versioning computed from commit types, and a changelog generated from the
same commits. That's the main reason the commit format is enforced.
