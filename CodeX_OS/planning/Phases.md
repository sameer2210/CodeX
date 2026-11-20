# CodeX Delivery Phases

**Status:** Proposed order; refine after full repository audit and student validation.

## Phase 0 — Audit and validate
Repository/security audit, existing feature inventory, broken-flow list, student feedback, approved MVP scope and acceptance criteria.
**Exit gate:** verified baseline and high-risk gaps documented.

## Phase 1 — Reliable foundation
Auth/authorization audit, validation, error handling, logging, env validation, real test scripts, CI checks, credential rotation/history review.
**Exit gate:** core tests pass and critical access-control issues are fixed or explicitly block release.

## Phase 2 — DSA problem-solving MVP
Curated problem catalog, editor, isolated execution adapter, submissions, test results, resource limits.
**Exit gate:** untrusted code runs outside the API process and results are verified and reproducible.

## Phase 3 — AI learning mentor
Progressive hints, explanations, bug/complexity feedback, provider timeout/quota/cost handling.
**Exit gate:** failures are handled and representative feedback is reviewed/tested.

## Phase 4 — Collaboration
Study-room access, shared editing, presence, reconnect recovery, text chat; calls after TURN/provider and permissions are planned.
**Exit gate:** concurrent edits, reconnect, authorization, and persistence tests pass.

## Phase 5 — Progress
Learning dashboard, verified solved history, topic progress, revision queue, optional achievements.
**Exit gate:** progress is based on verified activity.

## Phase 6 — Contests
Contest lifecycle, published rules, server-side scoring, individual/team leaderboard, audit history, abuse controls.
**Exit gate:** deterministic versioned scoring and tie-breakers are tested.

## Phase 7 — Interactive DSA
Step-through visualizations, prediction questions, guided exercises.
**Exit gate:** learner usability testing supports the learning objective.

## Phase 8 — System Design Studio
Learning path, interactive diagrams, scenarios, trade-offs, evaluation rubrics.
**Exit gate:** content and rubric reviewed by knowledgeable practitioners.

## Phase 9 — Production readiness
Load/security tests, backups/restore drills, monitoring, alerting, rollback, privacy/retention.
**Exit gate:** agreed service, recovery, security, and cost targets are measured.

Do not start the next phase solely because code compiles. Record any accepted risk explicitly.
