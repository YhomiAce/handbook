---
title: Dependency updates
description: How we keep third-party dependencies current and respond to vulnerabilities.
sidebar:
  order: 2
---

Most of our code is other people's code. Keeping dependencies up to date is cheaper when done a little
at a time: a weekly batch of small bumps is easy, a two-year jump across major versions is a project.

## Automated update PRs

**Renovate** runs on every repository and opens PRs for outdated dependencies. Our shared config:

- **Patch and minor** updates for dev dependencies are grouped into one weekly PR and **auto-merged** when CI passes.
- **Patch and minor** updates for runtime dependencies are grouped weekly, and need one approval.
- **Major** updates get one PR each, never auto-merged. Read the changelog and migration guide.
- Lockfile maintenance runs monthly, refreshing transitive dependencies.
- New releases must be at least **3 days old** before Renovate proposes them (`minimumReleaseAge`), which protects against compromised or broken releases that get pulled quickly.

Whoever is on call owns the week's dependency PRs, as part of the quieter on-call work (see the [on-call guide](/operations/on-call/)).

## Reviewing an update PR

- Read the release notes for anything marked breaking, deprecated or security-related.
- Trust CI, but check that the affected area is actually covered by tests; if it isn't, test it by hand in a preview environment.
- For major upgrades, check for peer dependency conflicts and update related packages together (for example a framework and its plugins).

## Vulnerabilities

GitHub Dependabot alerts and `npm audit` in CI report known vulnerabilities. Response times depend on
severity **and** whether the vulnerable code is reachable in our use:

| Severity (CVSS) | Exploitable in our usage | Fix within |
| --- | --- | --- |
| Critical | Yes | **24 hours**, treat as an incident |
| High | Yes | 7 days |
| Critical / High | No, or not reachable | 30 days |
| Medium / Low | Any | Next routine update |

When no fixed version exists yet: assess whether you can mitigate (disable the feature, add input
validation, block the path at the WAF), document the decision on the alert, and set a reminder.

## Adding a new dependency

Before adding a package, consider whether you need it. Check:

- **Maintenance:** recent releases, responsive maintainers, more than one maintainer for critical packages.
- **Popularity and provenance:** weekly downloads, a public repository, published with npm provenance where possible.
- **Size and transitive dependencies:** `npm ls`, bundle size for frontend packages.
- **License:** MIT, Apache-2.0, BSD and ISC are fine. Anything copyleft (GPL, AGPL) needs approval.
- **Install scripts:** packages that run `postinstall` scripts deserve extra scrutiny.

Mention the reasoning in the PR description; reviewers will ask.

## Lockfiles

- Lockfiles are always committed, and CI installs with the frozen-lockfile command (`npm ci`) so builds are reproducible.
- Never edit lockfiles by hand. If one has conflicts, regenerate it from the package manifest.
- Keep runtime versions (Node.js, Go) pinned in the repo and update them like any other dependency, including the version used in Docker base images.
