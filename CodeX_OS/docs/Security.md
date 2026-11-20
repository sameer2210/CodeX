# CodeX Security and Privacy

## Priority risks
1. Arbitrary code execution.
2. Broken access control between teams, projects, rooms, submissions, and contests.
3. Exposed API/database credentials and JWT secrets.
4. Unauthorized Socket.IO room access or event spoofing.
5. Contest score manipulation/replay.
6. Denial of service via expensive code, AI requests, or real-time payloads.
7. Source/chat/submission data leaking through logs or AI-provider requests.
8. XSS, injection, insecure CORS, unsafe file handling.

## Required controls
- Rotate exposed credentials and remove them from active use.
- Use strong environment-managed secrets and separate credentials by environment.
- Validate input and enforce object-level authorization on each endpoint and sensitive socket event.
- Use least-privilege service/database credentials.
- Apply payload limits, execution quotas, AI quotas, timeouts, and rate limits.
- Use HTTPS in production and explicit allowed CORS origins.
- Never trust client-supplied roles, score, acceptance, ownership, or authoritative timestamps.
- Keep hidden tests and expected answers out of public responses and client bundles.
- Redact secrets and unnecessary sensitive content from logs.
- Define retention/deletion policies for code, chat, submissions, AI requests, and accounts.
- Do not record calls by default; recording requires explicit product, consent, and legal review.

## Code sandbox
A separate execution boundary is mandatory. Use a vetted provider or hardened isolation design. Require CPU, memory, wall-clock, process, filesystem, output, and network restrictions; ephemeral filesystems; cleanup; no host secrets/Docker socket/privileged mode; isolation between jobs; queue limits/cancellation; monitoring and abuse controls. Security-test before public launch.

## Incident response
Document credential revocation, disabling execution/AI, abuse investigation, restoration, required notifications, and service recovery.
