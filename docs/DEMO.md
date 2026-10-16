# Demo checklist

Use this for portfolio screenshots and interview walkthroughs.

## Local happy path (5–7 minutes)

1. `npm run db:up && npm run db:push && npm run db:seed && npm run dev`
2. Dashboard summary cards + job table with filters/sort
3. Open a job → **Analyze with AI** (mock) → show structured result
4. Change application status and save notes
5. Edit `/profile` (location includes Belgrade)
6. Optional: `npm run n8n:up`, import `n8n/workflows/job-ingest.json`, execute once, show Signal Forge on the dashboard, execute again to show duplicate prevention

## Screenshot set

Capture:

1. Dashboard with stats and filtered list
2. Job detail with AI analysis panel
3. Profile settings page
4. n8n workflow canvas (optional)
5. Terminal/output showing `duplicatePrevented: true` (optional)

Store images outside git or in a private folder unless you intentionally want them in the repo.

## Talking points

- Single Next.js app; no premature microservices
- Structured LLM output + Zod validation
- Mock provider for zero-cost development and tests
- Idempotent webhook ingest for automation
- Explicit non-goals: no auto-apply, no scraping blocked sites, no RAG/vector DB in MVP
