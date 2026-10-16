# Architecture

AI Job Radar is a single Next.js application. The UI and API live in one deployable unit. n8n is an optional local automation worker, not part of the web deploy.

```text
Browser
  → Next.js App Router (UI)
  → Route Handlers (/api/*)
  → Domain services (jobs, profile, AI, ingest)
  → PostgreSQL (Drizzle ORM)

n8n (local Docker)
  → POST /api/webhooks/jobs
  → ingest service (validate → dedupe/persist → analyze)
  → dashboard

Remotive (public API, no key)
  → POST /api/jobs/sync/remotive
  → map + dedupe/persist
  → dashboard (with Remotive attribution links)
```

Remotive terms require linking back to each job URL and crediting Remotive. Keep sync usage light (avoid tight polling loops).

## Layers

| Layer | Responsibility |
| ----- | -------------- |
| `app/` | Pages + Route Handlers. Thin: parse request, call service, return JSON/UI. |
| `components/` | Presentational and interactive UI. |
| `lib/*/service.ts` | Business logic and persistence orchestration. |
| `lib/validation/` | Zod schemas at API boundaries. |
| `lib/ai/` | Prompts, provider abstraction, structured output schema. |
| `lib/db/` | Drizzle schema + client. |

## AI design

1. Providers implement a shared interface (`mock` | `groq` | `openai`).
2. Default provider is `mock` so local work needs no paid API. Groq is the free-tier LLM option.
3. Model output is validated with Zod before persistence.
4. Prompts forbid inventing candidate experience and treat job text as untrusted.
5. `job_analyses` stores provider/model metadata for reproducibility.

## Idempotency

- Jobs are unique on a normalized `dedupe_key` (company + title + source URL).
- Webhook ingest returns the existing job on conflict instead of creating duplicates.
- Re-analysis upserts the single analysis row per job unless forced.

## Security baselines

- Secrets stay server-side (`.env.local`, never committed).
- Webhook calls require `N8N_WEBHOOK_SECRET`.
- No automatic applications or recruiter outreach.
- n8n is intended for localhost only in this project.
