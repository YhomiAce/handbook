---
title: Testing strategy
description: What we test, at which level, and what makes a test worth keeping.
sidebar:
  order: 3
---

Tests exist so that we can **change code with confidence**. A test that never fails, or fails for
reasons unrelated to behaviour, is a cost, not an asset.

## The shape we aim for

We don't chase a perfect pyramid. As a rule of thumb:

| Level           | Share  | Runs            | What it covers                                                                  |
| --------------- | ------ | --------------- | ------------------------------------------------------------------------------- |
| Unit            | ~60%   | Every commit    | Pure logic: calculations, parsing, validation, state machines                   |
| Integration     | ~30%   | Every commit    | A module with its real database, queue or HTTP layer; external APIs faked       |
| End-to-end      | ~10%   | Every merge     | A handful of critical user journeys (sign up, checkout, invite a teammate)      |
| Contract        | as needed | Every commit | The shape of APIs we expose to, or consume from, other teams                   |

Integration tests give the most confidence per test for typical CRUD code, so don't be afraid of them.
They run against real Postgres and Redis in Docker, because mocks of a database tell you little.

## What to test

- **Behaviour, not implementation.** Test through the public interface. If a refactor that doesn't change behaviour breaks tests, those tests are coupled to internals.
- **Every bug fix gets a regression test** that fails before the fix.
- **Edge cases** that matter: empty, one, many; boundaries; invalid input; time zones and daylight saving; concurrency where it exists.
- **Error paths.** What does the user (or the caller) see when the payment provider times out?

Don't test framework code, trivial getters, or third-party libraries.

## Writing good tests

- One behaviour per test, named as a sentence: `it('rejects an expired invite token')`.
- Arrange, act, assert, with a blank line between each.
- Build test data with factories, overriding only the fields that matter for the test.
- No sleeping. Wait for conditions, or control time with fake timers.
- Tests must be independent and runnable in any order. Each integration test starts from a clean state (transactions rolled back, or truncated tables).

```ts
it('applies the annual discount to yearly plans only', () => {
  const plan = buildPlan({ interval: 'year', price: 120_00 });

  const total = priceFor(plan, { coupon: 'ANNUAL20' });

  expect(total).toBe(96_00);
});
```

## Flaky tests

A flaky test erodes trust in the whole suite. When you find one:

1. Open a ticket with the failure output, labelled `flaky-test`.
2. If you can't fix it within a day, **quarantine** it (skip it, linking the ticket) so it doesn't block others.
3. Quarantined tests are reviewed weekly. A test quarantined for more than a month is deleted or rewritten.

## Coverage

We report coverage but don't gate on a number: 100% coverage of the wrong assertions proves nothing.
Reviewers look at whether the *important* paths are tested (see the [code review guide](/practices/code-review/)).
A drop in coverage on a PR is a prompt for a conversation, not an automatic failure.

## In CI

- Unit and integration tests run on every push. They must finish in under 10 minutes; if they don't, we parallelise or speed them up.
- End-to-end tests run on merge to `main`, against the staging environment, before the production deploy.
- A red `main` stops the line: fixing it is the top priority for whoever broke it.
