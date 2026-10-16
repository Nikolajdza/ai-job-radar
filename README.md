# AI Job Radar

Personal job-search dashboard for discovering roles, comparing them to a candidate profile with AI analysis, and tracking applications.

Learning portfolio project — not a commercial SaaS product. The system never applies to jobs or contacts recruiters without explicit user approval.

## Current status

**MVP + Remotive sync + apply/match UX**

- Search, role chips (Frontend / Full-stack / Backend), pagination, sorting
- Sync up to 60 software jobs from Remotive (focus: all / frontend / …)
- Apply opens the real listing (no auto-apply)
- Profile + CV text; AI can extract profile fields from pasted CV
- Job match analysis uses the saved profile/CV
- Auth/sign-in postponed (single local profile)
- Mock AI by default; optional **Groq** (free tier) or OpenAI; local n8n
- Optional daily Remotive sync via Vercel Cron

## Requirements

- Node.js 20+ (tested with Node 24)
- npm 10+
- Docker Desktop (Postgres + optional n8n)
- Optional: OpenAI API key only if you set `AI_PROVIDER=openai`

## Getting started

```bash
cp .env.example .env.local
npm install
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
npm run build
```

### n8n automation

```bash
npm run n8n:up
```

Follow [n8n/README.md](n8n/README.md).

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the development server         |
| `npm run build`       | Production build                     |
| `npm run start`       | Run the production build             |
| `npm run lint`        | Run ESLint                           |
| `npm test`            | Run Vitest unit tests                |
| `npm run db:up`       | Start local Postgres                 |
| `npm run db:down`     | Stop Compose services                |
| `npm run n8n:up`      | Start local n8n                      |
| `npm run n8n:down`    | Stop n8n                             |
| `npm run stack:up`    | Start Postgres + n8n                 |
| `npm run db:push`     | Push schema to the database          |
| `npm run db:generate` | Generate SQL migrations              |
| `npm run db:migrate`  | Apply generated migrations           |
| `npm run db:seed`     | Seed sample jobs and profile         |
| `npm run db:studio`   | Open Drizzle Studio                  |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deploy (free-tier notes)](docs/DEPLOY.md)
- [Demo checklist](docs/DEMO.md)
- [n8n local setup](n8n/README.md)

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets.

| Variable             | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string                 |
| `AI_PROVIDER`        | `mock` (default), `groq`, or `openai`        |
| `GROQ_API_KEY`       | Required when `AI_PROVIDER=groq` (free tier) |
| `GROQ_MODEL`         | Optional (default `openai/gpt-oss-120b`)     |
| `OPENAI_API_KEY`     | Required only when `AI_PROVIDER=openai`      |
| `OPENAI_MODEL`       | Optional (default `gpt-4o-mini`)             |
| `N8N_WEBHOOK_SECRET` | Shared secret for `/api/webhooks/jobs`       |
| `CRON_SECRET`        | Protects Vercel Cron Remotive sync (prod)    |

## Definition of done (MVP)

- [x] View and manage job listings (search/filter/sort/status/notes)
- [x] Maintain a candidate profile
- [x] Analyze a job with mock AI (and real OpenAI when configured)
- [x] Persist AI analysis results
- [x] Track application statuses
- [x] Trigger/inspect an n8n workflow in the documented local setup
- [x] Run tests, lint, and build
- [x] Safe example env vars and no secrets in git
- [ ] Optional: deploy frontend + DB on free-tier hosts (see [docs/DEPLOY.md](docs/DEPLOY.md))

## Roadmap completed

1. Milestone 1 — UI with mock data
2. Milestone 2 — PostgreSQL persistence
3. Milestone 3 — AI job analysis
4. Milestone 4 — n8n local automation
5. Milestone 5 — Portfolio quality
