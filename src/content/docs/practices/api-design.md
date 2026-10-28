---
title: API design guidelines
description: Conventions for our HTTP APIs, covering resources, errors, pagination and versioning.
sidebar:
  order: 4
---

These guidelines apply to every HTTP API we build, internal or public. Consistency matters more than
any single choice: a client that has used one of our APIs should be able to guess how the next one works.

## Resources and URLs

- Use **plural nouns** for collections and IDs for members: `/invoices`, `/invoices/inv_8f2k`.
- Nest only one level, for true ownership: `/customers/{id}/invoices`. Otherwise filter: `/invoices?customer_id=cus_123`.
- Use `kebab-case` in paths and `snake_case` in JSON fields and query parameters.
- IDs are opaque strings with a type prefix (`inv_`, `cus_`). Never expose auto-increment integers.
- Actions that don't map to CRUD are sub-resources with a verb: `POST /invoices/{id}/send`.

## Methods and status codes

| Method   | Use                         | Success status                         | Idempotent |
| -------- | --------------------------- | -------------------------------------- | ---------- |
| `GET`    | Read                        | `200`                                  | yes        |
| `POST`   | Create, or trigger an action | `201` with `Location`, or `202` if async | no (use an idempotency key) |
| `PATCH`  | Partial update              | `200` with the updated resource         | yes        |
| `PUT`    | Full replace (rare)         | `200`                                  | yes        |
| `DELETE` | Delete                      | `204`                                  | yes        |

Common error statuses: `400` malformed request, `401` not authenticated, `403` authenticated but not
allowed, `404` not found (also used instead of `403` when revealing existence would leak information),
`409` conflict, `422` validation failed, `429` rate limited, `500` our fault, `503` temporarily unavailable.

## Request bodies and validation

- Accept and return `application/json`. Timestamps are RFC 3339 strings in UTC (`2026-03-14T09:26:53Z`). Money is an integer amount in minor units, plus an ISO 4217 currency code.
- Validate every request at the boundary with a schema, and reject unknown fields on writes.
- `POST` endpoints that create things or move money accept an `Idempotency-Key` header. Replaying the same key within 24 hours returns the original response.

## Errors

Every error response uses the same shape, based on [RFC 9457 (Problem Details)](https://www.rfc-editor.org/rfc/rfc9457):

```json
{
  "type": "https://api.example.com/errors/validation-failed",
  "title": "Validation failed",
  "status": 422,
  "detail": "2 fields are invalid.",
  "code": "validation_failed",
  "request_id": "req_01HV3M7Q9X",
  "errors": [
    { "field": "email", "code": "invalid_format", "message": "Must be a valid email address." },
    { "field": "due_date", "code": "in_past", "message": "Must be today or later." }
  ]
}
```

- `code` is a stable, machine-readable string; clients branch on it, never on `title` or `detail`.
- `request_id` matches the `X-Request-Id` response header and our logs, so support can find the request.
- **Never** return stack traces, SQL, or internal hostnames. Log them server-side under the request ID.

## Pagination

List endpoints are always paginated, using **cursor pagination**:

```http
GET /invoices?limit=50&starting_after=inv_8f2k
```

```json
{
  "data": [ { "id": "inv_8f2l" } ],
  "has_more": true,
  "next_cursor": "inv_9a1b"
}
```

- `limit` defaults to 20, maximum 100.
- Cursors are opaque to clients. Sort order is stable (by creation time, then ID).
- Offset pagination (`?page=3`) is allowed only for small admin lists where users need page numbers; it is slow and inconsistent on large, changing tables.

Filtering uses plain query parameters (`?status=paid&created_after=2026-01-01T00:00:00Z`). Sorting uses
`sort=created_at` or `sort=-created_at` for descending.

## Versioning

- Public APIs are versioned in the path: `/v1/invoices`. Internal APIs between our own services are unversioned and evolve with [contract tests](/practices/testing-strategy/).
- Within a version, only make **additive** changes: new endpoints, new optional fields, new enum values (clients must tolerate unknown values).
- Breaking changes (removing or renaming fields, changing types or semantics, new required inputs) need a new version.
- When a version is deprecated, responses include `Deprecation` and `Sunset` headers, and we give at least **6 months** notice to external clients.

## Checklist for a new endpoint

- [ ] Resource and URL follow the naming rules above
- [ ] Request validated with a schema; unknown fields rejected on writes
- [ ] Authorization checked for the specific resource, not only authentication
- [ ] Errors use the problem-details shape with a stable `code`
- [ ] Lists are paginated
- [ ] Rate limits configured
- [ ] Documented in the OpenAPI spec, with examples
- [ ] Logs and metrics include the route and status code
