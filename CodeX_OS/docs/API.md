# CodeX API Contracts

**Status:** Contract template and inventory starting point. Do not treat proposed routes as implemented. Audit existing routers/controllers before changing or adding endpoints.

## Existing route patterns observed in supplied files
- Auth router mounts under `/api/auth`.
- Project router mounts under `/api/projects`.
- Auth routes shown include register, login, verify, logout, team members/activity, and team messages.
- Project routes shown include create, list, fetch by ID, update, and AI review.
- API response formats are not fully consistent across all supplied controllers; standardize only with an explicit compatibility plan.

## Contract rules for new endpoints
For each endpoint document:
- Method/path and versioning policy.
- Purpose and authentication requirement.
- Resource ownership/role requirements.
- Request schema, validation, size limits.
- Success status and response schema.
- Error statuses and safe error format.
- Idempotency/retry semantics.
- Rate/cost limits.
- Audit/logging and privacy behavior.
- Tests including unauthorized and malformed requests.

## Proposed future API domains
- Problems and topics.
- Submissions and execution status.
- Learning progress and revision.
- Study rooms and membership.
- Contests, entries, results, and leaderboard.
- AI hints/reviews.
- System Design exercises and evaluations.

These are proposals, not existing endpoints. Prefer the established routing conventions until an audit supports a change.
