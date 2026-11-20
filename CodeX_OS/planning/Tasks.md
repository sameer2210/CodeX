# CodeX Task Backlog

**Status:** Initial backlog; verify items during audit.

## P0 — Audit and secure
- [ ] Inspect complete repository, branches, manifests, lockfiles, and deployment.
- [ ] Check Git history for committed credentials; rotate exposed credentials and remediate history appropriately.
- [ ] Audit JWT secret handling, CORS, request validation, team/project authorization, and Socket.IO events.
- [ ] Review in-memory rate limiting, proxy trust, and resource bounds.
- [ ] Establish actual test/lint/type-check/build commands.
- [ ] Record verified working and broken flows.

## P1 — DSA MVP
- [ ] Define problem, topic, test-case, submission, and progress contracts.
- [ ] Select safe execution provider/isolation architecture.
- [ ] Implement bounded execution queue, resource limits, cancellation, and result persistence.
- [ ] Build problem browsing and solving UI.
- [ ] Add server-verified sample/hidden test results.
- [ ] Test authorization, timeout, output limits, and duplicate submissions.

## P2 — AI learning
- [ ] Define hint levels and solution-reveal behavior.
- [ ] Implement bounded provider contracts, timeouts, quotas, and safe errors.
- [ ] Add complexity/optimization feedback with assumptions.
- [ ] Track usefulness, latency, and cost without leaking code/secrets.

## P3 — Collaboration
- [ ] Audit current synchronization and persistence.
- [ ] Decide collaboration protocol and reconnect semantics.
- [ ] Implement study-room authorization.
- [ ] Test simultaneous editing and reconnect.
- [ ] Audit chat privacy and WebRTC signaling.
- [ ] Select TURN/managed call infrastructure.

## P4 — Progress, contests, learning
- [ ] Define verified progress metrics.
- [ ] Define team score, tie-breakers, eligibility, and audit history.
- [ ] Implement contest lifecycle and server-derived leaderboard.
- [ ] Prototype one DSA visualization and test with learners.
- [ ] Define revision rules and System Design evaluation rubric.

## Task template
- Objective:
- Acceptance criteria:
- Files/areas inspected:
- Implementation:
- Tests/checks run:
- Risks/unresolved issues:
- Documentation/memory updated:
