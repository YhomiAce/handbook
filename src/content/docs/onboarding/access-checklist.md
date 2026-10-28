---
title: Access checklist
description: Every account and permission a new engineer needs, and who grants it.
sidebar:
  order: 3
---

Work through this list on day one. Request everything at once: some approvals take a day. When you
**leave** the team, your manager uses the same list in reverse.

We follow **least privilege**: you get what your role needs, and production access is granted when you
join the on-call rotation, not before.

## Day one (everyone)

| System                   | What for                         | How to get it                              | Granted by |
| ------------------------ | -------------------------------- | ------------------------------------------ | ---------- |
| Google Workspace         | Email, calendar, docs            | Created before you start                   | IT         |
| Password manager         | Shared vaults, your passwords    | Invite sent to your work email             | IT         |
| Slack                    | Chat                             | SSO with Google                            | Automatic  |
| GitHub (`acme` org)      | Code, PRs, issues                | Send your username in `#it-help`           | Eng manager |
| Linear                   | Tickets and planning             | SSO with Google                            | Automatic  |
| Figma (viewer)           | Designs                          | SSO with Google                            | Automatic  |

## First week (engineers)

| System                       | What for                            | How to get it                         | Granted by     |
| ---------------------------- | ----------------------------------- | ------------------------------------- | -------------- |
| CI (GitHub Actions)          | Re-run jobs, view logs              | Comes with GitHub team membership     | Automatic      |
| Staging cloud account        | Read logs, debug staging            | Access request ticket                 | Platform team  |
| Error tracking (Sentry)      | Errors and performance              | SSO with Google, request a team       | Platform team  |
| Metrics and logs (Grafana)   | Dashboards, log search              | SSO with Google                       | Automatic      |
| Feature flags                | Toggle flags in staging             | Access request ticket                 | Eng manager    |

## When you join on-call

| System                         | What for                                   | How to get it                    | Granted by     |
| ------------------------------ | ------------------------------------------ | -------------------------------- | -------------- |
| Paging (PagerDuty)             | Receive pages                              | Added when you join the rotation | On-call lead   |
| Production cloud (read-only)   | Logs, metrics, describe resources          | Access request, manager approval | Platform team  |
| Production cloud (break-glass) | Write access during incidents, time-boxed  | Requested per incident, audited  | Incident lead  |
| Production database (read replica) | Debug queries                          | Access request, manager approval | Platform team  |

:::caution
Break-glass access expires after 4 hours and every use is reviewed in the weekly incident review. If
you find yourself needing it outside an incident, that's a gap in our tooling. Raise it.
:::

## Checklist

Copy this into your onboarding ticket and tick items off as they arrive:

```md
- [ ] Laptop: disk encryption on, screen lock ≤ 5 min, OS up to date
- [ ] Password manager set up, with a strong master password and 2FA
- [ ] 2FA enabled on Google, GitHub and Slack (hardware key or authenticator app; not SMS)
- [ ] GitHub: added to the acme org and your team
- [ ] Commit signing configured
- [ ] Slack channels: #eng, #eng-deploys, #incidents, your team
- [ ] Staging cloud access
- [ ] Sentry and Grafana access
- [ ] Read: secrets handling, incident response runbook
```

## Offboarding

When someone leaves, their manager opens an offboarding ticket on their last day, and access to all
systems above is removed **the same day**. Shared secrets they had access to are rotated within a week
(see [secrets handling](/security/secrets/#rotation)).
