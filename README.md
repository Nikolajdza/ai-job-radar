# AI Job Radar

Personal job-search dashboard for discovering roles, comparing them to a candidate profile with AI analysis, and tracking applications.

Learning portfolio project — not a commercial SaaS product. The system never applies to jobs or contacts recruiters without explicit user approval.

## Current status

**Milestone 4 — n8n integration**

- Local n8n via Docker Compose (`localhost:5678`)
- Authenticated ingest webhook with idempotent dedupe
- Workflow creates/persists a job, runs AI analysis, and stubs a strong-match notification
- Mock AI remains the default (no paid API required)

## Requirements

- Node.js 20+ (tested with Node 24)
- npm 10+
- Docker Desktop (Postgres + n8n)
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

### n8n automation

```bash
npm run n8n:up
```

Then follow [n8n/README.md](n8n/README.md) to import `n8n/workflows/job-ingest.json` and run the sample job.

Quick webhook test without the n8n UI:

```bash
curl -s -X POST http://localhost:3000/api/webhooks/jobs \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: dev-n8n-secret-change-me" \
  -d @n8n/sample-job.json
```

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the development server         |
| `npm run build`       | Production build                     |
| `npm run start`       | Run the production build             |
| `npm run lint`        | Run ESLint                           |
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

## Project layout

```text
src/
  app/                 Pages and Route Handlers
  components/          UI components
  data/                Sample seed content
  lib/
    ai/                Prompts, providers, analysis service
    ingest/            n8n ingest orchestration
    db/                Drizzle client + schema
    jobs/              Job domain logic
    profile/           Profile domain logic
    validation/        Zod schemas
    webhooks/          Webhook auth helpers
n8n/                   Workflow export + local automation docs
docker-compose.yml     Local PostgreSQL + n8n
drizzle/               SQL migrations
```

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets.

| Variable              | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string              |
| `AI_PROVIDER`         | `mock` (default) or `openai`              |
| `OPENAI_API_KEY`      | Required only when `AI_PROVIDER=openai`   |
| `OPENAI_MODEL`        | Optional model id (default `gpt-4o-mini`) |
| `N8N_WEBHOOK_SECRET`  | Shared secret for `/api/webhooks/jobs`    |

## Roadmap

1. Milestone 1 — UI with mock data
2. Milestone 2 — PostgreSQL persistence
3. Milestone 3 — AI job analysis (mock + real provider)
4. Milestone 4 — n8n local automation *(current)*
5. Milestone 5 — Tests, docs, free-tier deploy
