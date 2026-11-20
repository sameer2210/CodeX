# CodeX Known Issues and Risks

This is a risk register from the supplied files, not a claim that every item has been reproduced in the complete repository. Verify before changing code.

## High-priority review items
- **Credential exposure:** supplied `.env` includes a Google API key and weak JWT secret. Treat the key as exposed, rotate it, and check Git history/deployment secrets.
- **JWT fallback:** supplied config shows a weak fallback JWT secret. Production should fail fast if required secrets are missing.
- **Mongo URI fallback:** supplied config shows an HTTP-looking fallback for `MONGODB_URI`; verify and fail fast rather than silently using an invalid URI.
- **Socket CORS:** supplied `server.js` uses `origin: '*'` with credentials enabled; verify runtime behavior and use explicit allowed origins.
- **Socket authentication:** supplied middleware appears to allow connections without a valid token; determine whether this is intended and protect sensitive events.
- **Project room authorization:** supplied code joins a room from a client-provided project ID and token team; verify that the project belongs to that team before joining.
- **Call signaling:** some supplied handlers accept client-provided socket IDs; verify recipient authorization and room membership.
- **Code execution:** supplied files do not establish a safe execution implementation. Never execute arbitrary code in the API process.
- **Rate limiting:** supplied custom in-memory rate limiter may not fit multi-instance production; inspect bounds and proxy handling.
- **Team membership:** supplied auth logic uses a shared team password and can add usernames; review identity, invitation, and membership security.
- **AI response parsing:** supplied AI service accesses a nested response path directly; verify SDK contract and handle empty/provider-error responses.
- **Frontend token handling:** supplied frontend config stores JWT in localStorage and clears all localStorage on 401; assess XSS risk and avoid deleting unrelated application state.
- **Documentation drift:** supplied README refers to OpenAI/GPT-4o while code shown uses Google GenAI; reconcile after verifying implementation.
- **Tests:** supplied backend package script says no tests specified; inspect full repository before concluding tests are absent.

For each confirmed issue, record reproduction steps, severity, affected files/version, root cause, fix, regression test, and verification evidence.
