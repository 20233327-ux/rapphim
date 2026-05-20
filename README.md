<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

CI status:

[![CI](https://github.com/20233327-ux/rapphim/actions/workflows/ci.yml/badge.svg)](https://github.com/20233327-ux/rapphim/actions/workflows/ci.yml)

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0d63f3f5-3526-44f2-8cb8-5b1ba27a31a0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with PostgreSQL-backed API

1. Install dependencies:
   - `npm install`
2. Create env files:
   - Copy `.env.example` to `.env`
   - Copy `.env.db.example` to `.env.db`
3. Start PostgreSQL:
   - `npm run db:up`
4. Start backend API:
   - `npm run api:dev`
5. Start frontend (new terminal):
   - `npm run dev`

Frontend will call `/api/data` and persist data into PostgreSQL through the Express API.
Frontend login now uses `POST /api/auth/login` and stores JWT on the client for authenticated write flows.

## API capabilities (123)

The backend now includes:

- JWT auth endpoint: `POST /api/auth/login`
- Refresh endpoint: `POST /api/auth/refresh`
- Current session endpoint: `GET /api/auth/me`
- Version endpoint: `GET /api/version`
- Resource CRUD endpoints (JWT required for write operations):
   - `GET /api/resources/:resource`
   - `POST /api/resources/:resource`
   - `PUT /api/resources/:resource/:id`
   - `DELETE /api/resources/:resource/:id`
- Auto migration on API startup (`DB_AUTO_MIGRATE=true` by default)

Supported resources:

- `movies`, `rooms`, `showtimes`, `users`, `bookings`, `shifts`

Default seeded login credentials after migrations:

- Admin: `admin@cinema.com` / `Admin@123`
- Staff: `staff@cinema.com` / `Staff@123`

Sample login request:

```bash
curl -X POST http://localhost:4000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"identifier":"admin@cinema.com","password":"Admin@123"}'
```

Then use `Authorization: Bearer <token>` for write CRUD calls.

The frontend also restores login session automatically on reload by calling `/api/auth/me` with stored JWT.
When access token expires, frontend automatically calls `/api/auth/refresh` and retries the request once.

## Database preparation for deploy

This repo includes a PostgreSQL starter setup for deployment:

1. Copy database environment template:
   - `.env.db.example` -> `.env.db`
2. Start PostgreSQL locally:
   - `npm run db:up`
3. View database logs:
   - `npm run db:logs`
4. Stop database:
   - `npm run db:down`

Files included:

- `db/migrations/001_init.sql`: schema + constraints + indexes
- `db/migrations/002_seed_user_passwords.sql`: default password hashes for seeded users
- `db/seed/001_seed.sql`: initial sample data
- `docker-compose.db.yml`: PostgreSQL container setup
- `db/README.md`: detailed database usage notes

## Deploy to web (single service)

The backend now serves the built frontend from `dist/` in production.

### 1) Deploy with Docker (any provider)

1. Build image:
   - `docker build -t cinemahub:latest .`
2. Run container:
   - `docker run --rm -p 4000:4000 --env-file .env cinemahub:latest`

Required production env vars:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `PORT` (optional, platform usually injects this)

Recommended:

- `DB_AUTO_MIGRATE=true`
- `DB_RUN_SEED=false`
- `AUTH_ALLOW_PLAINTEXT_DEV=false`

Ready-to-use environment templates:

- `.env.render.example`
- `.env.railway.example`

### 2) Deploy to Render quickly

This repo includes `render.yaml` for blueprint deployment.

1. Push repo to GitHub.
2. In Render: **New +** -> **Blueprint** -> select this repo.
3. Set secrets/env vars in Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
4. Deploy and verify:
   - `GET /api/health/live` returns `status: live`
   - `GET /api/health` returns detailed checks

Detailed Render setup checklist:

1. Create PostgreSQL first (Render Postgres or external provider).
2. Copy internal connection string into `DATABASE_URL`.
3. Add required vars:
   - `JWT_SECRET` (long random string)
   - `JWT_REFRESH_SECRET` (different long random string)
4. Add recommended vars:
   - `NODE_ENV=production`
   - `DB_AUTO_MIGRATE=true`
   - `DB_RUN_SEED=false`
   - `AUTH_ALLOW_PLAINTEXT_DEV=false`
5. Trigger deploy and watch build logs until container is healthy.
6. Smoke test:
   - Open `/`
   - Call `/api/health/live`
   - Call `/api/health`

### 2.1) Deploy to Railway (alternative)

1. Create a new project in Railway and connect this GitHub repo.
2. Add PostgreSQL service in the same project.
3. In app service variables, set:
   - `DATABASE_URL` (from Railway Postgres)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `DB_AUTO_MIGRATE=true`
   - `DB_RUN_SEED=false`
   - `AUTH_ALLOW_PLAINTEXT_DEV=false`
4. Railway injects `PORT` automatically; no manual value needed.
5. Deploy and verify:
   - `GET /api/health/live`
   - `GET /api/health`
   - `GET /api/version`

Health endpoint behavior in production:

- `GET /api/health/live`: liveness check for platforms/load balancers.
- `GET /api/health`: readiness-style check with DB latency, uptime, version, and status.
- `GET /api/version`: returns service name, app version, environment, and commit when available.

## GitHub Actions CI/CD

Workflow files:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

What it does:

1. `ci.yml` runs on PR and push: `npm ci`, `npm run lint`, `npm run build`, `node --check server/index.js`
2. `deploy.yml` runs only after CI succeeds on `main`
3. Deploy workflow triggers Render deploy hook if `RENDER_DEPLOY_HOOK_URL` is set
4. Deploy workflow triggers Railway deploy hook if `RAILWAY_DEPLOY_HOOK_URL` is set

Repository secrets to configure in GitHub:

- `RENDER_DEPLOY_HOOK_URL` (optional)
- `RAILWAY_DEPLOY_HOOK_URL` (optional)

Rollback quick playbook:

1. Render: open the service -> `Events` or `Deploys` -> choose last healthy deploy -> `Redeploy`.
2. Railway: open the service -> `Deployments` -> select previous successful deployment -> `Redeploy`.
3. If migration caused the issue, set `DB_AUTO_MIGRATE=false` temporarily before redeploying.
4. Verify rollback with `/api/health/live`, `/api/health`, and `/api/version`.

### 3) Local production smoke test

1. `npm run build`
2. `npm run start`
3. Open `http://localhost:4000` (web app)
4. Check `http://localhost:4000/api/health/live`
5. Check `http://localhost:4000/api/health`
6. Check `http://localhost:4000/api/version`
