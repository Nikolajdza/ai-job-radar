# AI Job Radar

AI co-pilot for a job search: discover remote software roles, import your CV, see an honest AI match for every listing, and prepare a tailored cover letter before you apply.

Learning portfolio project — not a commercial SaaS product. The system never applies to jobs or contacts recruiters for you.

## Features

- **Accounts** — email/password plus optional GitHub and Google sign-in (Better Auth)
- **Public browsing** — visitors can browse jobs and open job pages; everything personal needs an account
- **Profile** — photo, headline, bio, location, experience, skills (tag input), preferences, links, profile-strength meter
- **PDF CV import** — upload a PDF, AI extracts fields into the profile, you review and save
- **AI match** — score, matching/missing skills, seniority check, CV suggestions per job
- **Application kit** — AI cover letter (tone + English/Serbian), editable, copy/download, checklist, mark as applied
- **Private pipeline** — per-user status, saved jobs, notes, and private manually added jobs
- **Job sources** — Remotive sync (button + optional daily Vercel Cron), manual entry, local n8n ingest
- **AI providers** — deterministic mock by default, free **Groq** LLM, or OpenAI

## Requirements

- Node.js 20+ (tested with Node 24)
- npm 10+
- Docker Desktop (Postgres + optional n8n)
- Optional: free Groq API key for real AI

## Getting started

```bash
cp .env.example .env.local   # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm install
npm run db:up
npm run db:upgrade
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and upload your CV on the profile page.

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

| Command               | Description                                         |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Start the development server                        |
| `npm run build`       | Production build                                    |
| `npm run start`       | Run the production build                            |
| `npm run lint`        | Run ESLint                                          |
| `npm test`            | Run Vitest unit tests                               |
| `npm run db:up`       | Start local Postgres                                |
| `npm run db:down`     | Stop Compose services                               |
| `npm run n8n:up`      | Start local n8n                                     |
| `npm run n8n:down`    | Stop n8n                                            |
| `npm run stack:up`    | Start Postgres + n8n                                |
| `npm run db:upgrade`  | Apply migrations (also works on `db:push`-created DBs) |
| `npm run db:generate` | Generate SQL migrations                             |
| `npm run db:migrate`  | Apply generated migrations                          |
| `npm run db:seed`     | Seed the public sample job catalog                  |
| `npm run db:studio`   | Open Drizzle Studio                                 |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deploy (free-tier notes)](docs/DEPLOY.md)
- [Demo checklist](docs/DEMO.md)
- [n8n local setup](n8n/README.md)

## Environment

Copy `.env.example` to `.env.local`. Never commit real secrets.

| Variable                                    | Purpose                                             |
| ------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL`                              | PostgreSQL connection string                        |
| `BETTER_AUTH_SECRET`                        | Session signing secret (required in production)     |
| `BETTER_AUTH_URL`                           | Public app URL, e.g. `http://localhost:3000`        |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional GitHub sign-in                             |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google sign-in                             |
| `AI_PROVIDER`                               | `mock` (default), `groq`, or `openai`               |
| `GROQ_API_KEY`                              | Required when `AI_PROVIDER=groq` (free tier)        |
| `GROQ_MODEL`                                | Optional (default `openai/gpt-oss-120b`)            |
| `OPENAI_API_KEY`                            | Required only when `AI_PROVIDER=openai`             |
| `OPENAI_MODEL`                              | Optional (default `gpt-4o-mini`)                    |
| `N8N_WEBHOOK_SECRET`                        | Shared secret for `/api/webhooks/jobs`              |
| `INGEST_USER_EMAIL`                         | Optional account whose profile n8n ingest analyses  |
| `CRON_SECRET`                               | Protects Vercel Cron Remotive sync (prod)           |

## Definition of done

- [x] Browse jobs publicly; sign up / sign in (email, GitHub, Google)
- [x] Per-user profile with photo, skills, bio, links, and PDF CV import via AI
- [x] AI job analysis persisted per user
- [x] AI cover letters with editing, copy, and download
- [x] Track application statuses and notes per user
- [x] Trigger/inspect an n8n workflow in the documented local setup
- [x] Run tests, lint, and build
- [x] Safe example env vars and no secrets in git
- [x] Deploy on free tiers (Vercel + Supabase, see [docs/DEPLOY.md](docs/DEPLOY.md))
