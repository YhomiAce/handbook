---
title: Secrets handling
description: Where secrets live, how they reach applications, and what to do if one leaks.
sidebar:
  order: 1
---

A **secret** is anything that grants access: API keys, database passwords, signing keys, OAuth client
secrets, private keys, session secrets, webhook signing secrets. Treat every one as if leaking it would
make the news.

## The rules

1. **Never commit secrets to Git**, not even to a private repo, not even "temporarily". Git history is forever, and forks and clones copy it.
2. **Never paste secrets into Slack, tickets, docs or AI assistants.** Share them through the password manager.
3. **Production secrets live only in the secrets manager.** Nobody keeps copies on their laptop.
4. **Each environment has its own secrets.** Staging keys never work in production, and vice versa.
5. **Least privilege.** A key should grant only what its consumer needs: a read-only key for a reporting job, scoped tokens for CI.

## Where secrets live

| Secret | Stored in | Who can read it |
| --- | --- | --- |
| Production and staging app secrets | Cloud secrets manager | The application's runtime identity; break-glass for humans |
| CI secrets (deploy credentials) | GitHub Actions environments, with required reviewers for production | Workflows on `main` |
| Shared team credentials (vendor dashboards) | Password manager, team vaults | Members of the vault |
| Local development values | `.env` on your machine (git-ignored), sandbox keys only | You |

Every repository has a `.env.example` listing the variables the app needs, with **fake** values, and
`.gitignore` excludes `.env`.

## How secrets reach applications

Applications read secrets from **environment variables** (or mounted files) injected at startup from
the secrets manager. They're never baked into container images or build artefacts.

:::caution
Watch out for build-time variables in frontend frameworks (`NEXT_PUBLIC_*`, `VITE_*`, `PUBLIC_*`).
They're inlined into JavaScript sent to every browser. **Anything with a public prefix is public.**
Only put values there that you'd be happy to see on a billboard.
:::

Applications must not log secrets. Our logger redacts known keys (`password`, `token`, `authorization`,
`secret`, `api_key`), but don't rely on that: avoid logging whole request headers or config objects.

## Preventing leaks

- **Pre-commit scanning:** `gitleaks` runs as a pre-commit hook and in CI on every PR.
- **GitHub secret scanning and push protection** are enabled on every repository; a push containing a known secret format is blocked.
- In [code review](/practices/code-review/), treat a hard-coded credential as a `blocking:` comment, even in tests (use obviously fake values like `sk_test_fake`).

## Rotation

| Secret type | Rotation |
| --- | --- |
| Database passwords, internal service credentials | Automatically, every 90 days |
| Third-party API keys | Yearly, and when someone with access leaves |
| Signing keys (JWT, webhooks) | Yearly, with a key-ID overlap so old tokens stay valid during rollover |
| Any secret a departing employee could read | Within one week of their last day |

Design for rotation: an application should accept **two valid keys at once** during a rollover window.

## If a secret leaks

If a secret is exposed (committed, pasted in Slack, sent to the wrong person, found in logs):

1. **Rotate it immediately.** Revoke the old value at the provider and issue a new one. Removing the commit is **not** enough: assume it's already been copied by bots that scan GitHub in seconds.
2. **Tell `#security`** (or the security lead directly). No blame: fast reporting is what matters.
3. **Check for misuse** in the provider's access logs since the exposure.
4. If there's any sign of misuse, declare a SEV-1 following the [incident response runbook](/operations/incident-response/#security-incidents).
5. Afterwards, clean up the exposure (history rewrite, message deletion) and add a safeguard so it can't happen the same way twice.
