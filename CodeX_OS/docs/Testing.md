# CodeX Testing Strategy

## Layers
- Unit: business rules, validation, scoring, complexity metadata.
- Integration: APIs, database, authorization, AI adapter, execution adapter, persistence.
- Real-time: room authorization, event validation, reconnect, ordering/versioning, simultaneous edits.
- E2E: register/login, solve problem, receive feedback, collaborate, view progress.
- Security: cross-team access, invalid tokens, event spoofing, rate limits, malicious submissions, hidden-test exposure.
- Performance: concurrent editors, execution queue pressure, contest spikes, AI quota exhaustion.
- Accessibility: keyboard navigation, focus, labels, contrast, reduced motion.

## Regression scenarios
- Users cannot read/write another team's private resources.
- Socket cannot join a room without authorization.
- Reconnect does not silently lose accepted edits.
- Duplicate submissions do not double-count score.
- Client cannot forge accepted status or leaderboard points.
- Execution timeout/output limits are enforced.
- AI provider failures return safe, understandable errors.
- Malformed input and empty states do not crash the app.
- Failed provider/database operations are not reported as success.

## Test discipline
Inspect current scripts/frameworks first. Use deterministic fixtures and isolate external services where appropriate. Keep hidden tests server-side. Run focused tests during development and relevant broader checks before completion. State which checks were not run and why.
