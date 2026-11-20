# CodeX — AI Engineering Operating System

## Mission
Build CodeX into a secure, reliable, student-first collaborative DSA and System Design learning platform. Optimize for learning outcomes, correctness, maintainability, accessibility, and trust—not code volume.

## Start every task
1. Inspect `git status`; preserve all user changes.
2. Read this file and relevant `docs/`, `planning/`, and `ai/` documents.
3. Inspect actual code, package manifests, lockfiles, call sites, tests, and scripts related to the task.
4. Separate verified current behavior from proposed behavior and assumptions.
5. Define acceptance criteria and a proportionate plan before substantial changes.

Never assume existing code works just because it exists or is described in documentation.

## Source-of-truth rules
- Follow explicit approved user requirements and security constraints.
- `docs/PRD.md` describes intended product behavior.
- `docs/Architecture.md` and `docs/TechStack.md` must distinguish observed current state from proposals.
- `docs/Rules.md`, `docs/Security.md`, `docs/Testing.md`, and `docs/Design.md` define cross-cutting standards.
- `planning/Phases.md` and `planning/Tasks.md` define delivery order and acceptance gates.
- `planning/Decisions.md` records consequential architectural decisions.
- `ai/Memory.md` is a concise handoff, not a replacement for code inspection.
If documents conflict, surface the conflict; do not silently make consequential assumptions.

## Engineering workflow
For substantial work:
1. Understand the user story and acceptance criteria.
2. Trace relevant components, APIs, models, events, dependencies, and data flows.
3. Identify root cause, edge cases, security concerns, and migration impact.
4. Plan a focused implementation.
5. Implement small, reviewable changes.
6. Add or update tests.
7. Run relevant tests, lint, type checks, and build commands that actually exist.
8. Review the final diff for regressions, security issues, and unrelated changes.
9. Update relevant docs, tasks, decisions, and memory.
10. Report changes, evidence, and unresolved issues honestly.

Use a proportionate process for trivial, low-risk changes.

## Product principles
- Teach problem-solving rather than defaulting to full-answer disclosure.
- Make collaborative state, participant presence, connection status, and permissions clear.
- Make contest rankings reproducible and based on server-verified results.
- Make AI feedback explainable and advisory.
- Build accessible, responsive, motivating learning flows.
- Never invent product metrics or claim unverified capabilities.

## Engineering standards
- Preserve the established architecture unless evidence supports a documented change.
- Prefer readable, cohesive, testable modules and explicit contracts.
- Avoid speculative abstractions, unrelated refactors, and unnecessary dependencies.
- Validate untrusted inputs and enforce authorization server-side.
- Do not trust client-supplied identity, role, team membership, score, acceptance status, or execution results.
- Never execute submitted code inside the main API process or an unrestricted host environment.
- Protect secrets in code, logs, documentation, commits, and responses.
- Do not overwrite/reset/delete user work, commit, push, deploy, or change production data without appropriate authorization.
- Assess API compatibility and data migrations before schema/contract changes.

## Verification
Never claim a test, audit, build, or manual check passed unless it actually ran and passed. Report checks as Verified, Partially verified, Not verified, or Failed. Distinguish existing failures from regressions with evidence.

## Definition of done
Acceptance criteria addressed; relevant checks run or limitations stated; security and regression risks reviewed; unrelated user work preserved; necessary documentation and memory updated; final report accurately states changes and remaining risks.
