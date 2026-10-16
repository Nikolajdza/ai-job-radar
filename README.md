# AI Job Radar

Personal job-search dashboard for discovering roles, comparing them to a candidate profile with AI analysis, and tracking applications.

Learning portfolio project — not a commercial SaaS product. The system never applies to jobs or contacts recruiters without explicit user approval.

## Current status

**Milestone 2 — Persistence**

- Next.js App Router + TypeScript + Tailwind CSS
- Local PostgreSQL via Docker Compose
- Drizzle ORM schema, Zod validation, Route Handlers
- Job CRUD, duplicate detection, candidate profile editing
- Dashboard reads from the database

## Requirements

- Node.js 20+ (tested with Node 24)
- npm 10+
- Docker Desktop (for local Postgres)

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

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the development server         |
| `npm run build`      | Production build                     |
| `npm run start`      | Run the production build             |
| `npm run lint`       | Run ESLint                           |
| `npm run db:up`      | Start local Postgres                 |
| `npm run db:down`    | Stop local Postgres                  |
| `npm run db:push`    | Push schema to the database          |
| `npm run db:generate`| Generate SQL migrations              |
| `npm run db:migrate` | Apply generated migrations           |
| `npm run db:seed`    | Seed sample jobs and profile         |
| `npm run db:studio`  | Open Drizzle Studio                  |

## Project layout

```text
src/
  app/                 Pages and Route Handlers
  components/          UI components
  data/                Sample seed content
  lib/
    db/                Drizzle client + schema
    jobs/              Job domain logic
    profile/           Profile domain logic
    validation/        Zod schemas
docker-compose.yml     Local PostgreSQL
drizzle/               Generated migrations (after db:generate)
```

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets.

| Variable       | Purpose                          |
| -------------- | -------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string     |

## Roadmap

1. Milestone 1 — UI with mock data
2. Milestone 2 — PostgreSQL persistence *(current)*
3. Milestone 3 — AI job analysis (mock + real provider)
4. Milestone 4 — n8n local automation
5. Milestone 5 — Tests, docs, free-tier deploy
