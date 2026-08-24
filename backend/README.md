# CampusFix Backend (Phase 7)

Express + MongoDB (Mongoose) API for CampusFix, replacing the Phase 1-6
frontend's mock service layer with a real, authenticated backend.

## Stack

- Express 4
- MongoDB via Mongoose 8
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- CORS configured for the Vite dev server

## Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set MONGODB_URI and a real JWT_SECRET
npm run seed   # optional: creates demo users + sample issues
npm run dev    # starts on http://localhost:5000 (nodemon)
```

Requires a running MongoDB instance (local `mongod`, Docker, or MongoDB
Atlas). See `.env.example` for the connection string format.

## Demo accounts (after `npm run seed`) — DEVELOPMENT ONLY

| Role    | Email                   | Password    |
|---------|--------------------------|-------------|
| Student | student@campusfix.demo  | student123  |
| Staff   | staff@campusfix.demo    | staff123    |
| Admin   | admin@campusfix.demo    | admin123    |

Never use these credentials, or plaintext demo passwords in general, in a
production deployment.

## API overview (base path `/api/v1`)

### Auth
- `POST /auth/register` — public, creates a student account
- `POST /auth/login` — public, returns `{ token, user }`
- `GET /auth/me` — protected, returns the current user
- `POST /auth/logout` — protected (stateless JWT; client discards the token)

### Issues
- `GET /issues` — all issues
- `GET /issues/mine` — student only, own reported issues
- `GET /issues/assigned` — staff only, issues assigned to them
- `POST /issues` — student only, create an issue
- `GET /issues/:id` — single issue (with `comments` and `activity` attached)
- `PATCH /issues/:id/status` — staff/admin
- `PATCH /issues/:id/priority` — staff/admin
- `PATCH /issues/:id/assign` — admin
- `PATCH /issues/:id/unassign` — admin

### Votes
- `GET /issues/:id/vote` — the caller's current vote
- `POST /issues/:id/vote` — student only, body `{ voteType: "up" | "down" }`

### Comments
- `GET /issues/:id/comments`
- `POST /issues/:id/comments` — body `{ text }`

### Activity
- `GET /issues/:id/activity`

### Users (admin)
- `GET /users?role=&department=`
- `GET /users/:id`
- `POST /users` — create staff/admin accounts
- `PATCH /users/:id`
- `PATCH /users/me` — any authenticated user updates their own name/avatar

### Notifications
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read/all`

All routes except `/auth/register` and `/auth/login` require
`Authorization: Bearer <token>`. Role checks are enforced server-side via
`authorizeMiddleware.js` — the frontend's route guards are a UX
convenience only, not a security boundary.

## Notes on scope

Departments and issue-category management (Admin Portal Phase 6 §8/§9)
remain frontend-only mock data in this phase — there is no
`Department`/`Category` model here. `adminService.js` on the frontend was
updated to pull real data for Students/Staff (via `GET /users`) while
Departments/Categories continue to use the existing mock arrays. This was
a deliberate scope decision, not an oversight — extending the schema to
cover those is straightforward future work if needed.
