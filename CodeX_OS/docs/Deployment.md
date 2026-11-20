# CodeX Deployment and Operations

**Status:** Checklist; actual hosting provider and production topology are not verified.

## Environments
Maintain separate development, staging, and production configuration and credentials. Never commit `.env`. Validate required environment variables at startup and fail fast when required secrets or connection strings are missing.

## Before deployment
- Review Git diff and ensure no unrelated changes or secrets.
- Run relevant tests, lint, type checks, and production build.
- Verify database migrations/backfills and rollback plan.
- Verify CORS allowlist, HTTPS, JWT secrets, cookie/token strategy, rate limits, and proxy configuration.
- Verify execution sandbox resource/network limits and worker isolation.
- Verify Socket.IO authentication, room authorization, adapter, and reconnect behavior.
- Verify AI quotas, timeouts, and provider failure behavior.
- Verify logs redact credentials and sensitive user content.

## Operations
- Provide health/readiness checks that do not expose secrets.
- Monitor API errors/latency, database health, socket connections, execution queue depth/failures, AI usage/cost, and abuse signals.
- Keep backups and test restoration.
- Document credential rotation, rollback, incident response, and disabling execution/AI in an incident.
- Use graceful shutdown for HTTP/socket servers and execution workers.

## Scale decisions
Do not add Redis, microservices, or orchestration solely for fashion. Add shared state, queues, adapters, or separate workers when measured load and reliability requirements justify them.
