# CodeX Engineering Rules

## General
- Inspect before editing; avoid unrelated refactors.
- Follow existing conventions unless a documented decision changes them.
- Do not invent endpoints, fields, scripts, versions, or environment variables.
- Preserve behavior unless a change is requested or a verified defect requires correction.

## Frontend
- Use semantic, accessible, keyboard-operable UI.
- Model loading, empty, error, offline, and success states.
- Keep components cohesive; extract abstractions only when useful.
- Never rely on client-only authorization.
- Avoid hard-coded production URLs/secrets.
- Clean up real-time listeners and connection lifecycles.
- Respect reduced-motion settings and design for mobile and desktop.

## Backend
- Validate bodies, params, queries, and socket payloads.
- Enforce authentication, resource ownership, membership, and roles server-side.
- Use safe, consistent errors and bounded payloads/work.
- Add appropriate timeouts, rate limits, and query bounds.
- Avoid unbounded in-memory maps and swallowed exceptions.
- Base indexes on actual query patterns.

## Real-time
- Authenticate sockets and authorize each sensitive event.
- Validate room membership on joins and read/write events.
- Handle disconnect, reconnect, duplicate events, stale updates, and missed messages.
- Do not broadcast private content globally.
- Define authoritative document state/versioning and persistence semantics.

## AI
- Treat model output as untrusted and advisory.
- Bound inputs/outputs, timeouts, usage, and costs.
- Do not claim correctness or optimization without evidence.
- Prefer progressive hints before complete solutions.
- Never use AI output as the authoritative contest judge.
- Minimize personal data and secrets sent to providers.

## Code execution and contests
- Never execute user code in the API process or unrestricted host.
- Use a vetted sandbox/provider with CPU, memory, wall-time, process, filesystem, output, and network limits.
- Keep hidden tests/expected outputs server-side.
- Derive scores and acceptance from trusted execution results.
- Make scoring deterministic, versioned, and auditable.

## Changes and dependencies
- Inspect manifests and lockfiles before dependency changes.
- Explain material dependency/security trade-offs.
- Do not delete lockfiles or perform broad upgrades without authorization.
- Assess compatibility and migration before schema/API changes.
- Never expose `.env` contents in docs, logs, screenshots, or commits.

## Verification
- Add regression tests for fixes and test relevant authorization/edge cases.
- Run actual project scripts and report exactly what ran.
- Never mark unexecuted checks as passed.
