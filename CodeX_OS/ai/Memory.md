# CodeX Project Memory

**Status:** Initial handoff; full repository audit pending.

## Product goal
A student-focused collaborative DSA and System Design learning platform with:
- Collaborative coding for two or more users.
- Teams, study rooms, contests, individual/team rankings.
- AI-guided hints, code review, bug explanations, complexity analysis, and optimization.
- DSA visualizations, interactive practice, gamification, and revision.
- System Design scenarios and simulations.
- Chat and audio/video collaboration.

## Partial current-state evidence
From supplied files only:
- Backend uses Node.js ES modules, Express, Mongoose/MongoDB, Socket.IO, JWT, bcryptjs, and Google GenAI SDK.
- Team, Project, and Message models are shown.
- Socket handlers exist for team/project rooms, code-change broadcasts, chat persistence, and WebRTC signaling.
- Frontend snippets use React, React Router, Redux-related hooks, Tailwind utility classes, and Framer Motion.
- Full repository, lockfiles, tests, deployment, and runtime behavior remain unaudited.

## Security follow-up
Supplied `.env` includes a Google API key and weak JWT secret. Treat the key as exposed: rotate it and check use/history. Replace the JWT secret with a strong environment-managed value. Verify Git history and deployment secrets. Never copy secret values into docs.

## Priorities
1. Audit full repository and preserve current work.
2. Verify auth, team/project authorization, socket event authorization, and CORS.
3. Decide safe code execution before accepting public submissions.
4. Establish test/build baseline.
5. Approve MVP acceptance criteria and implement in small phases.

## Open decisions
Coding-agent conventions; execution provider; collaboration protocol; AI provider/budget; contest scoring; call/TURN infrastructure; supported languages; problem content source.

## Next handoff
Perform a read-only audit of the complete GitHub repository/current branch. Do not start broad refactors before recording baseline and reviewing high-priority security risks.
