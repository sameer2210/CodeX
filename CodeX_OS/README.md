# CodeX AI Developer Operating System

Starter documentation pack for evolving the existing CodeX repository into a collaborative DSA and System Design learning platform.

## Structure
- `AGENTS.md`: shared repository instructions for multiple coding agents
- `docs/`: PRD, architecture, stack, design, security, testing, API, database, review, deployment
- `planning/`: phases, tasks, decisions, known issues
- `ai/Memory.md`: concise handoff and current priorities

## Important limitations
This is a first draft based on the product vision and only a subset of source files supplied in the conversation. It is not a complete repository audit. Current-state statements must be verified against the full repository. Proposed features are not claimed to be implemented.

The supplied `.env` contained a Google API key and a weak JWT secret. Rotate exposed credentials, check Git history and deployment secrets, and never commit `.env`.

## Recommended next steps
1. Back up/commit existing work safely before changing files.
2. Approve MVP scope in `docs/PRD.md`.
3. Audit the full repository and update `docs/Architecture.md`, `docs/TechStack.md`, and `planning/KnownIssues.md`.
4. Choose a safe code-execution architecture before running untrusted submissions.
5. Implement one small task at a time from `planning/Tasks.md`, with tests and evidence.
