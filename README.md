# AI Job Radar

Personal job-search dashboard for discovering roles, comparing them to a candidate profile with AI analysis, and tracking applications.

Learning portfolio project — not a commercial SaaS product. The system never applies to jobs or contacts recruiters without explicit user approval.

## Current status

**Milestone 1 — Working UI with mock data**

- Next.js App Router + TypeScript + Tailwind CSS
- Dashboard summary cards and searchable job table
- Static sample listings in `src/data/sample-jobs.ts`
- No database, LLM API, or n8n required

## Requirements

- Node.js 20+ (tested with Node 24)
- npm 10+

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build         |
| `npm run start` | Run the production build |
| `npm run lint`  | Run ESLint               |

## Project layout

```text
src/
  app/                 App Router pages and layout
  components/          UI components
  data/                Sample data (until persistence)
  lib/                 Types and pure helpers
```

## Roadmap

1. Milestone 1 — UI with mock data *(current)*
2. Milestone 2 — PostgreSQL persistence
3. Milestone 3 — AI job analysis (mock + real provider)
4. Milestone 4 — n8n local automation
5. Milestone 5 — Tests, docs, free-tier deploy
