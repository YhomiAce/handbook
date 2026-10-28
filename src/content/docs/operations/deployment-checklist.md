---
title: Deployment checklist
description: What to check before, during and after shipping a change to production.
sidebar:
  order: 4
---

Every merge to `main` deploys automatically: CI builds an image, deploys to **staging**, runs the
end-to-end suite and then promotes to **production** with a canary. Automation does the work; this
checklist covers what automation can't judge.

## Before merging

- [ ] PR approved and CI green (see the [code review guide](/practices/code-review/))
- [ ] Risky behaviour is behind a **feature flag**, defaulting to off
- [ ] Database migrations are **backward compatible** with the currently running code (see below)
- [ ] New environment variables or secrets exist in staging *and* production before the code that reads them
- [ ] Metrics, logs or alerts exist to tell you whether the change works
- [ ] You know how to roll back, and rollback is safe (no irreversible data change)
- [ ] You're available for the next hour to watch it. Avoid Friday afternoons and the day before a holiday
- [ ] No deploy freeze is in effect (check the pinned message in `#eng-deploys`)

## Database migrations

Code and schema are deployed separately, so for a while old code runs against the new schema. Use the
**expand/contract** pattern:

1. **Expand:** add the new column or table (nullable, or with a default). Deploy.
2. **Migrate:** deploy code that writes to both old and new, backfill existing rows, then switch reads to the new location.
3. **Contract:** once nothing reads the old column, drop it in a later release.

Never rename or drop a column in the same release as the code change. Large backfills run as
background jobs in batches, not inside the migration.

## During the deploy

- [ ] Watch the deploy in `#eng-deploys`: staging, end-to-end tests, canary, full rollout
- [ ] During the canary (10% of traffic, 10 minutes), compare error rate and latency with the baseline on the **Service overview** dashboard
- [ ] Check error tracking for new error types from the new release

The pipeline automatically halts and rolls back the canary if the error rate is more than double the
baseline. If you see something wrong that the automation missed, halt the rollout yourself; don't wait.

## After the deploy

- [ ] Verify the change in production yourself: the feature works, the bug is fixed
- [ ] Turn on the feature flag gradually (internal users, then 10%, 50%, 100%), watching metrics at each step
- [ ] Keep an eye on dashboards for 30 minutes; some problems only show up under real traffic or on scheduled jobs
- [ ] Close the ticket, and mention anything noteworthy in `#eng-deploys`

## If something goes wrong

Don't debug in production while users suffer. **Roll back first**, then investigate. Follow the
[rollback runbook](/operations/rollback/), and declare an incident if users were affected
([incident response](/operations/incident-response/)).
