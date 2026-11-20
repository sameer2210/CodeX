# CodeX Architecture

**Status:** Partial baseline inferred from files supplied in the conversation. Verify against the full repository before implementation.

## 1. Current implementation observed
- Backend package manifest lists Node.js ES modules, Express 4, Mongoose, Socket.IO, JWT/bcryptjs, Helmet, CORS, Morgan, dotenv, and `@google/genai`.
- Backend files show Team, Project, and Message Mongoose models.
- `server.js` includes Socket.IO handlers for team/project rooms, code changes, chat persistence, and WebRTC signaling.
- Supplied frontend files show React, React Router, Redux-related imports, Tailwind utility classes, and Framer Motion.
- This is a partial inventory, not a full audit. Frontend manifest, tests, lockfiles, hosting, and runtime behavior remain unverified.

## 2. Proposed logical architecture
1. Web client: learning UI, editor, study room, dashboards, contest interface, visualizations, System Design exercises.
2. API: auth, profiles, teams, problems, submissions, progress, contests, AI orchestration.
3. Real-time layer: room membership, presence, shared document updates, chat, call signaling.
4. Code execution service: isolated workers/containers or a vetted provider. Never execute arbitrary submissions in the API process.
5. Persistence: keep MongoDB initially if verified requirements fit; review models/indexes before adding domains.
6. AI adapter: provider abstraction, input limits, timeouts, quotas, usage accounting, and output handling.
7. Media provider: WebRTC signaling plus TURN infrastructure or managed calling.
8. Operations: logs, metrics, health checks, error reporting, backups, deployment controls.

## 3. Conceptual domain boundaries
Identity/authorization; teams/memberships/invitations; problems/topics/hints; shared sessions/document versions; executions/submissions; AI feedback/usage; progress/revision; contests/entries/scoring; System Design exercises/rubrics; notifications/moderation.

These are conceptual boundaries, not a mandate for a microservice or collection per domain.

## 4. Key flows
### Submission
Authenticate/authorize -> create submission -> isolated execution -> evaluate tests/resource limits -> persist result -> update progress/contest from verified result -> notify client.

### Collaboration
Authenticate -> verify room access -> join -> synchronize versioned edits -> recover after reconnect -> persist recoverable state. Audit current synchronization before assuming full-document broadcasts are safe for concurrent edits.

### AI
Bounded context -> access/quota checks -> minimize sensitive data -> provider call with timeout -> validate response -> label as AI-generated -> record usage -> display hints/analysis. AI must not decide contest acceptance or ranking.

### Contest
Authoritative schedule -> eligible submission -> verified execution -> versioned scoring rules -> leaderboard derived from trusted records -> auditable corrections.

## 5. Security boundaries
API is not a code sandbox. Client state is not authoritative for roles, membership, scoring, or acceptance. Authorize every sensitive socket event. Validate identifiers, payloads, sizes, and ownership. Restrict signaling recipients. Keep secrets out of source/logs. Minimize logged source code and private content.

## 6. Proposed repository areas
Adapt to the actual repository; do not move files automatically.
- Existing frontend root: routes, features, shared UI, state, API client.
- Existing backend root: config, routes/controllers, services, models, middleware.
- `docs/`, `planning/`, `ai/`, and `tests/`.
- A separate execution worker/deployment unit only when justified by the selected hosting and isolation design.

## 7. Investigations required
Current edit synchronization/persistence; MongoDB query/index fit; code execution provider; collaboration protocol; auth/invitation model; deployment topology/queue/Redis needs; privacy/retention/backups.
