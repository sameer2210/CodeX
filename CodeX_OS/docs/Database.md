# CodeX Data Model Notes

**Status:** Partial model inventory from supplied files; proposals are not implemented schemas.

## Models observed
### Team
Fields shown include `teamName`, `password`, `members`, `createdAt`, and `updatedAt`. Embedded members include `username`, `isAdmin`, `lastLogin`, `joinedAt`, and `isActive`.

### Project
Fields shown include `name`, `teamName`, `code`, `review`, and timestamps.

### Message
Fields shown include `teamName`, optional `projectId`, `username`, `message`, and `timestamp`.

Verify constraints, indexes, uniqueness/collation, ownership checks, data retention, and actual query patterns in the full codebase.

## Proposed future entities/concepts
Problem, Topic, Submission, ExecutionJob, LearningProgress, StudyRoom, RoomMembership, Contest, ContestEntry, ScoreEvent/LeaderboardSnapshot, AIUsage, SystemDesignExercise, and Evaluation.

Do not create these collections wholesale before domain and query requirements are approved. Some may be embedded, derived, or implemented through existing models.

## Data rules
- Never store plaintext passwords, API keys, or access tokens.
- Validate ownership and membership on the server.
- Keep hidden tests/expected answers protected.
- Treat scores and accepted status as server-derived.
- Use idempotency/unique constraints where duplicate events could double-count.
- Add indexes based on query and sort patterns; measure before over-indexing.
- Plan schema migrations/backfills and rollback before destructive changes.
- Define deletion and retention policies for user data, code, chat, submissions, and AI records.
