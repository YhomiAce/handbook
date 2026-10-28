---
title: 'ADR 0002: Postgres-backed job queue'
description: Why background jobs use a queue stored in Postgres rather than a separate broker.
sidebar:
  order: 4
  label: 'ADR 0002: Postgres job queue'
---

- **Status:** Accepted
- **Date:** 2025-06-03
- **Deciders:** Platform team, product team leads

## Context

The `worker` process runs background jobs: sending email, generating PDFs, delivering outgoing
webhooks. Jobs were originally pushed to Redis lists. Two problems kept recurring:

1. **Lost or phantom jobs.** A job was enqueued in Redis, then the database transaction that created the related record rolled back, so the worker processed a record that didn't exist. Or the transaction committed but the Redis push failed, and the email was never sent.
2. **Redis was treated as durable.** A Redis failover in April 2025 lost ~2,000 queued jobs (see that month's postmortem).

Volume is modest: around 40,000 jobs a day, peaking at ~20 per second.

## Options considered

### Option A: A dedicated broker (RabbitMQ or a managed cloud queue)

- **Pros:** built for queuing; high throughput; mature tooling.
- **Cons:** still not transactional with Postgres, so we'd need an outbox table anyway to fix problem 1; another critical system to run, monitor and secure.

### Option B: Transactional outbox in Postgres, relayed to Redis

- **Pros:** fixes consistency.
- **Cons:** two moving parts (outbox relay and Redis queue) and Redis durability is still a concern.

### Option C: A queue stored in Postgres

Jobs are rows in a `jobs` table, inserted in the same transaction as the business change. Workers
claim jobs with `SELECT ... FOR UPDATE SKIP LOCKED`, using a maintained library rather than our own code.

- **Pros:** enqueueing is transactional, so problems 1 and 2 disappear; no new infrastructure; jobs are queryable with SQL for debugging; backups cover the queue.
- **Cons:** adds write load to the primary database; throughput is limited compared to a dedicated broker (comfortably thousands of jobs per second, far above our needs); requires vacuuming and pruning of completed jobs.

## Decision

We will use a **Postgres-backed job queue** (option C) for all background jobs. Every job must be
idempotent and carry an idempotency key. Completed jobs are kept for 7 days, then pruned; failed jobs
move to a dead-letter state after 10 attempts with exponential backoff, and alert the owning team.

Redis remains in use for caching and rate limiting only, where losing data is acceptable.

## Consequences

- Enqueueing a job is just an insert inside the existing transaction; consistency bugs of type 1 are no longer possible.
- The queue appears in the [system overview](/architecture/system-overview/) as part of the data layer.
- We need dashboards for queue depth, job age and dead-letter count, and a paging alert when the oldest pending job is older than 15 minutes (see the [on-call guide](/operations/on-call/#alerts-we-care-about)).
- **We'll revisit** if sustained volume exceeds ~500 jobs per second, or if queue load measurably affects primary database latency.
