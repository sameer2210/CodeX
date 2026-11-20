# CodeX Technology Stack

**Rule:** label entries Current (observed), Proposed, or Undecided. Verify versions from complete manifests and lockfiles before upgrades.

## Current technologies observed in supplied files
| Area | Observed | Status |
|---|---|---|
| Runtime | Node.js ES modules | Current; runtime version unverified |
| HTTP API | Express `^4.21.2` in supplied backend manifest | Current; lockfile unverified |
| Database/ODM | MongoDB + Mongoose `^8.18.1` | Current; deployment unverified |
| Real-time | Socket.IO `^4.8.1` | Current |
| Authentication | JWT + bcryptjs | Current; security audit required |
| Middleware | Helmet, CORS | Current; configuration audit required |
| Logging | Morgan and console logging | Current; structured logging may be needed |
| AI SDK | `@google/genai` `^0.8.0` | Current in supplied manifest; API/model compatibility unverified |
| Frontend | React, Vite, React Router, Redux-related imports | Partial evidence; inspect frontend manifest |
| Editor | Monaco is described in project material; package/implementation must be verified | Verify |
| Testing | Supplied backend test script says no tests specified | Gap to inspect |

## Capabilities to evaluate, not install automatically
- Isolated code execution provider/worker.
- Proven CRDT/OT collaboration approach if current synchronization is inadequate.
- Shared adapter/queue such as Redis only if deployment scale and architecture justify it.
- TURN service or managed real-time media provider.
- Structured logs, metrics, error monitoring, backups, CI checks.

## Dependency policy
Do not upgrade merely to appear modern. Check compatibility, security support, hosting constraints, migration cost, and official docs/changelogs before adopting APIs or major versions. Keep manifests and lockfiles consistent.
