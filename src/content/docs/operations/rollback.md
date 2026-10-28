---
title: Rollback runbook
description: How to quickly and safely revert a bad deploy, a flag change or a migration.
sidebar:
  order: 5
---

When a deploy causes problems, **roll back first and investigate later**. A rollback is almost always
faster and safer than a fix-forward under pressure. You never need permission to roll back your own
change, or any change during an incident.

## Decide: roll back, flag off, or fix forward?

| Situation | Do this |
| --- | --- |
| The problem is behind a feature flag | Turn the flag off. Fastest, no deploy needed |
| A recent deploy caused it and has no irreversible migration | **Roll back** the deploy |
| The deploy included a migration that old code can't run against | Fix forward, or roll back code only if the schema is compatible (see below) |
| The fix is a one-line change and you're certain | Fix forward is acceptable, but only if the pipeline is faster than a rollback (it usually isn't) |

## Roll back a service deploy

Every production release is an immutable, tagged image (`v2026.03.09-3`), and the previous releases stay
available.

1. **Announce it** in `#eng-deploys` (and the incident channel if there is one): "Rolling back api from v2026.03.09-3 to v2026.03.09-2."
2. **Pause auto-deploys**, so the next merge doesn't redeploy the bad change:
   ```bash
   deployctl pause api --reason "rollback, see #inc-20260309-checkout"
   ```
3. **Roll back** to the previous healthy release:
   ```bash
   deployctl releases api            # list recent releases and their status
   deployctl rollback api --to v2026.03.09-2
   ```
   The rollback skips the canary and takes about 3 minutes.
4. **Verify:** error rate and latency on the **Service overview** dashboard return to baseline. Check that the running version is what you expect:
   ```bash
   curl -s https://api.example.com/health | jq .version
   ```
5. **Revert the change on `main`** with a revert PR (`revert: feat(api): ...`), so `main` matches production again.
6. **Resume auto-deploys** once the revert is merged:
   ```bash
   deployctl resume api
   ```

## Roll back a feature flag

Open the flag in the flag dashboard, set it to **off** for all environments affected, and add a note
with the reason. Changes apply within 30 seconds. Announce it in `#eng-deploys`.

## Roll back a database migration

Migrations are the hard part, which is why the [deployment checklist](/operations/deployment-checklist/#database-migrations)
requires them to be backward compatible.

- **If the migration only expanded the schema** (added nullable columns or new tables), you can roll back the code and leave the schema alone. The old code ignores the new columns.
- **If the migration was destructive** (dropped or rewrote data), don't run a "down" migration in a panic. Declare an incident, involve the database owner, and consider a point-in-time restore to a new instance to recover the data.
- Down migrations are never run automatically in production.

## Restore from backup (last resort)

Production Postgres has continuous backups with point-in-time recovery for 14 days. Restores always go
to a **new** instance, never over the live one, so that you can compare and copy data back selectively.
This requires break-glass access and an incident commander's approval; follow the database restore
runbook in the platform team's repository.

## After a rollback

- Make sure the root cause is understood before re-landing the change, with a test that would have caught it.
- If users were affected, follow the [incident process](/operations/incident-response/) and write a postmortem.
