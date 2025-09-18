
# CodeX Backend

## Overview

CodeX is a collaborative AI-powered code editor platform. The backend is built with **Node.js**, **Express.js**, **MongoDB**, **Socket.IO** for real-time features, and **OpenAI** for AI code reviews. It supports team-based authentication, real-time code editing, chat, voice/video calls (via WebRTC signaling), and project management.

Key Features:

- **Team-based Auth**: Users join or create teams with unique usernames.
- **Projects**: Create, edit, and review code in real-time with team members.
- **Real-time Collaboration**: Chat, code syncing, and WebRTC calls.
- **AI Integration**: Automatic code reviews using GPT-4o.
- **Security**: JWT tokens, rate limiting, CORS, Helmet.

The API is RESTful with `/api` prefix. Real-time uses Socket.IO. Database: MongoDB.

## Folder Structure

CodeX/
├── Backend/ # Node.js + Express server
│ ├── package.json # Dependencies and scripts
│ ├── server.js # Entry point: HTTP server + Socket.IO setup
│ └── src/
│ ├── app.js # Express app setup (middleware, routes)
│ ├── config/
│ │ └── config.js # Environment config (e.g., API keys)
│ ├── controllers/ # Business logic for routes
│ │ ├── auth.controllers.js # Auth-related (register, login, etc.)
│ │ └── project.controllers.js # Project CRUD + AI review
│ ├── db/
│ │ └── db.js # MongoDB connection
│ ├── middlewares/
│ │ └── authMiddleware.js # JWT verification, rate limiting, access checks
│ ├── models/ # Mongoose schemas
│ │ ├── message.model.js # Chat messages (team/project-based)
│ │ ├── project.model.js # Projects (code, review, team-linked)
│ │ └── team.model.js # Teams (members, passwords)
│ ├── routes/ # Express route definitions
│ │ ├── auth.routes.js # /api/auth/_ (public + protected)
│ │ └── project.routes.js # /api/projects/_ (protected)
│ └── services/ # Reusable logic
│ ├── ai.service.js # OpenAI code review
│ ├── auth.service.js # Auth operations (hashing, JWT, team mgmt)
│ └── project.service.js # Project CRUD
├── .env # Environment variables (gitignored)
└── README.md # This file
text## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API key (for AI reviews)
- Postman (for API testing; see collection below)

Install dependencies:

```bash
cd Backend
npm install
Environment Variables
Create .env in Backend/:
textPORT=5000
MONGODB_URI=mongodb://localhost:27017/codex  # Or Atlas URI
JWT_SECRET=your-super-secret-jwt-key  # Min 32 chars
OPENAI_API_KEY=sk-your-openai-api-key
FRONTEND_URL=http://localhost:5173  # For CORS
Running the Server

Start MongoDB.
Run in dev mode:
bashnpm run dev  # Uses nodemon for auto-restart

Or production:
bashnpm start


Server runs on http://localhost:5000. Health check: GET / returns server status.
Socket.IO connects on the same port for real-time.
Workflow
High-Level Flow

Auth: User registers (creates team + first member) or logs in (joins team). JWT token issued, stored in localStorage (frontend).
Team Management: Fetch members, update activity (auto on login/logout).
Projects: Create/list/update projects (team-scoped). Edit code in real-time via Socket.IO.
Real-time:

Chat: Send/receive messages (persisted in DB, broadcast to team).
Code Editing: Join project room, broadcast changes (deltas/cursor).
Calls: Signal WebRTC offers/answers/ICE via Socket.IO (P2P on frontend).


AI Review: Trigger review on project code; save result to DB.
Security: All protected routes require JWT. Tokens expire in 24h. Rate limiting: 100 req/15min per IP.

Database Flow

Teams: One doc per team (password hashed, members array).
Projects: One doc per project (linked to teamName, stores code/review).
Messages: One doc per message (linked to team/project, timestamped).

Real-time Flow (Socket.IO)

Connect with JWT auth.
Auto-join team room on connect.
Events: Broadcast to team/project rooms.
User mapping: Track socket IDs for targeted calls.

API Routes
All responses: { success: true/false, message: "...", data: {...} }. Errors: 4xx/5xx with message.
Auth Routes (/api/auth)

Auth Routes (/api/auth)

POST /register
Description: Create a new team and add the first admin member. Validates input lengths (teamName >=3, username >=2, password >=6).
Auth Required: No
Body: { teamName: string, username: string, password: string }
POST /login
Description: Authenticate a user and add them as a member if new. Updates lastLogin. Returns JWT token and user details.
Auth Required: No
Body: { teamName: string, username: string, password: string }
GET /verify
Description: Verify the provided JWT and return user info (teamName, username, isAdmin).
Auth Required: Yes (JWT in Authorization header)
Body/Params: None
POST /logout
Description: Set the member's isActive to false (tracks offline status). Client should clear the token locally.
Auth Required: Yes (JWT)
Body/Params: None
GET /team/:teamName/members
Description: Fetch active team members (includes username, isAdmin, lastLogin, joinedAt, isActive).
Auth Required: Yes (JWT + must match teamName)
Body/Params: Path param: teamName (string)
PUT /team/:teamName/member/:username/activity
Description: Update a member's activity status.
Auth Required: Yes (JWT + must match teamName and self username)
Body: { isActive: boolean }
Params: Path params: teamName (string), username (string)
GET /team/:teamName/messages
Description: Retrieve the last 100 team messages, sorted by timestamp (ascending).
Auth Required: Yes (JWT + must match teamName)
Body/Params: Path param: teamName (string)

Projects Routes (/api/projects)
All routes are scoped to the authenticated user's team (filters by req.user.teamName).

POST /create
Description: Create a new project linked to the user's team.
Auth Required: Yes (JWT)
Body: { projectName: string }
GET /get-all
Description: List all projects for the user's team.
Auth Required: Yes (JWT)
Body/Params: None
GET /:id
Description: Fetch a specific project by ID (includes name, code, review).
Auth Required: Yes (JWT)
Body/Params: Path param: id (MongoDB ObjectId)
PUT /:id
Description: Update a project (typically the code field).
Auth Required: Yes (JWT)
Body: { code: string } (other fields can be added if needed)
Params: Path param: id (ObjectId)
POST /:id/review
Description: Trigger an AI-powered code review using OpenAI GPT-4o. Saves the review text to the project's review field.
Auth Required: Yes (JWT)
Body: {} (empty object)
Params: Path param: id (ObjectId)

On connect: Join team room, emit user-joined to others.
On disconnect: Emit user-left to team.

Chat

Emit: chat-message { text: string, projectId?: ObjectId }
Receive: chat-message (full msg obj, persisted in DB)

Code Editing

Emit: join-project projectId: string (joins teamId-projectId room)
Emit: code-change { projectId: string, delta: object, code: string, cursorPos: object }
Receive: code-change (broadcast to project room)

Calls (WebRTC Signaling)

Emit: call-user { username: string, offer: object, type: 'audio'|'video' } (to target user)
Receive: incoming-call { from: string, offer: object, type: string, callerSocket: string }
Emit: call-accepted { to: string, answer: object }
Receive: call-accepted { answer: object }
Emit: call-rejected { to: string }
Receive: call-rejected
Emit: ice-candidate { to: string, candidate: object }
Receive: ice-candidate { candidate: object }
Emit: end-call { to: string }
Receive: end-call

Database Models

Team: { teamName: string (unique), password: hashed, members: [{ username, isAdmin, lastLogin, joinedAt, isActive }], createdAt, updatedAt }

Methods: addMember(username, isAdmin), getActiveMembers()


Project: { name: string, teamName: string, code: string, review: string, createdAt, updatedAt }
Message: { teamName: string, projectId?: ObjectId, username: string, message: string, timestamp: Date }

Services & Controllers

Services: Pure logic (e.g., auth.service.js: hashing/JWT/team ops; project.service.js: CRUD; ai.service.js: OpenAI chat completion).
Controllers: Handle req/res (validation, call services, format responses).

Testing
Use the Postman collection (CodeX_API.postman_collection.json) for API tests:

Set {{BASE_URL}} = http://localhost:5000
After login, copy token to {{JWT_TOKEN}}
Create project, copy _id to {{PROJECT_ID}}

For real-time: Use Socket.IO tester tools or frontend.
Deployment

Heroku/Vercel: Set env vars, use MongoDB Atlas.
PM2: For production: pm2 start server.js
Scaling: Socket.IO supports Redis adapter for multi-instance.
HTTPS: Use for production (CORS/WS).

Troubleshooting

CORS Errors: Check FRONTEND_URL.
JWT Issues: Verify secret/expiration.
Mongo Errors: Ensure URI and connection.
AI Failures: Check OpenAI key; fallback to mock if needed.
Logs: Morgan (combined) for requests; console for sockets.

Contributing
Fork, PR with tests. Lint: ESLint (standard).
For questions: Check code comments or open issue.

Built with ❤️ by [sam] | Last Updated: September 14, 2025
```
