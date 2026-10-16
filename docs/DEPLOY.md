# Deploy guide (free-tier oriented)

This project can run fully locally at zero cost. A public demo typically uses:

- **Vercel Hobby** for the Next.js app
- **Supabase free tier** for PostgreSQL
- **n8n** kept local (or a separate host if you later choose one)

Free-tier limits change over time. Check current Vercel and Supabase plan terms before relying on them.

## What requires credentials

| Feature | Local mock | Deployed demo |
| ------- | ---------- | ------------- |
| Dashboard + CRUD | No paid key | Supabase DB URL |
| AI analysis | `AI_PROVIDER=mock` | Optional `groq` (free tier) or `openai` |
| n8n automation | Docker on laptop | Not required for a basic Vercel demo |
| Daily Remotive sync | Manual button | Optional Vercel Cron + `CRON_SECRET` |

## Before you deploy

1. Create a Supabase project and copy the Postgres connection string.
2. Apply the schema (`npm run db:push` or run SQL from `drizzle/`).
3. Seed if desired (`DATABASE_URL=... npm run db:seed`).
4. Create a Vercel project from this repo.
5. Set environment variables in Vercel:

```bash
DATABASE_URL=postgresql://...   # Supabase pooler URI preferred
AI_PROVIDER=mock
# Free-tier LLM (recommended for demos with real AI):
# AI_PROVIDER=groq
# GROQ_API_KEY=gsk_...
# Optional paid:
# AI_PROVIDER=openai
# OPENAI_API_KEY=...
# Cron (Hobby): set CRON_SECRET so GET /api/jobs/sync/remotive is protected
# CRON_SECRET=long-random-string
```

6. Deploy. Confirm `/` loads and `/profile` can read/write.
7. On the dashboard, sync with focus **All software** (not Frontend-only) to fill the board.

## Important limitations

- Do **not** commit `.env.local` or real API keys.
- Exposing `/api/webhooks/jobs` publicly requires a strong secret and ideally network restrictions.
- A continuously running public n8n instance is outside the zero-cost MVP path.
- OpenAI usage is metered; keep mock mode for demos when possible.

## Suggested demo mode for interviews

Use mock AI + seeded data on Vercel/Supabase. Mention that the OpenAI provider and n8n workflow are implemented and documented for local use.
