# CodeX Code Review Checklist

## Correctness
- Does the change meet acceptance criteria?
- Are edge cases and failure states handled?
- Are API/data contracts preserved or intentionally migrated?
- Are concurrency, retries, duplicate events, and stale state handled?

## Security/privacy
- Is authorization enforced server-side for each resource and sensitive event?
- Are inputs, payload sizes, execution costs, and AI requests bounded?
- Are secrets or private data exposed in code, logs, responses, or prompts?
- Can a client forge identity, ownership, score, or acceptance?
- Are injection, XSS, SSRF, or unsafe execution risks introduced?

## Maintainability
- Is the code cohesive and readable?
- Is logic duplicated? Is an abstraction justified?
- Are types/contracts/names clear?
- Do comments explain why rather than repeat the code?

## Performance/reliability
- Are queries bounded and indexed where appropriate?
- Are timeouts, cancellation, and failures handled?
- Is unbounded memory/work introduced?
- Does collaboration preserve synchronization/reconnect behavior?

## UX/accessibility
- Are loading, empty, error, offline, and disabled states clear?
- Does keyboard navigation work?
- Is layout responsive?
- Are AI feedback and rankings explainable?

## Verification
- Which tests/checks actually ran?
- What failed or remains unverified?
- Are docs and memory consistent with actual results?

## Outcome
- Blocking issues:
- Important issues:
- Minor improvements:
- Evidence:
- Decision: Approve / Request changes / Needs investigation
