# AI Job Radar

Personal job-search dashboard for discovering roles, comparing them to a candidate profile with AI analysis, and tracking applications.

Learning portfolio project — not a commercial SaaS product. The system never applies to jobs or contacts recruiters without explicit user approval.

## Current status

**Milestone 3 — AI job analysis**

- Structured match analysis with Zod validation
- Default **mock** provider (no API key, no cost)
- Optional **OpenAI** provider via Vercel AI SDK
- Analysis stored in PostgreSQL and shown on the job detail page
- Loading, error, and retry states in the UI

## Requirements

- Node.js 20+ (tested with Node 24)
- npm 10+
- Docker Desktop (for local Postgres)
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

Open [http://localhost:3000](http://localhost:3000), open a job, click **Analyze with AI**.

Mock mode is the default. To use OpenAI (paid):

```bash
# in .env.local
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Restart `npm run dev` after changing env vars.

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start the development server         |
| `npm run build`       | Production build                     |
| `npm run start`       | Run the production build             |
| `npm run lint`        | Run ESLint                           |
| `npm run db:up`       | Start local Postgres                 |
| `npm run db:down`     | Stop local Postgres                  |
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
    db/                Drizzle client + schema
    jobs/              Job domain logic
    profile/           Profile domain logic
    validation/        Zod schemas
docker-compose.yml     Local PostgreSQL
drizzle/               SQL migrations
```

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets.

| Variable         | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string                 |
| `AI_PROVIDER`    | `mock` (default) or `openai`                 |
| `OPENAI_API_KEY` | Required only when `AI_PROVIDER=openai`      |
| `OPENAI_MODEL`   | Optional model id (default `gpt-4o-mini`)    |

## Roadmap

1. Milestone 1 — UI with mock data
2. Milestone 2 — PostgreSQL persistence
3. Milestone 3 — AI job analysis (mock + real provider) *(current)*
4. Milestone 4 — n8n local automation
5. Milestone 5 — Tests, docs, free-tier deploy
