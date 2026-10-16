# Deploy guide (free-tier oriented)

A public demo uses:

- **Vercel Hobby** for the Next.js app
- **Supabase free tier** for PostgreSQL (use the **Transaction pooler** URI, port 6543)
- **Groq free tier** for real AI (or mock mode with no key)
- **n8n** kept local

Free-tier limits change over time. Check current plan terms before relying on them.

## What requires credentials

| Feature             | Local                   | Deployed demo                          |
| ------------------- | ----------------------- | -------------------------------------- |
| Dashboard + CRUD    | Docker Postgres         | Supabase pooler URI                    |
| Accounts            | `BETTER_AUTH_SECRET`    | `BETTER_AUTH_SECRET` + `BETTER_AUTH_URL` |
| GitHub / Google     | Optional OAuth apps     | Optional OAuth apps (prod callback URLs) |
| AI                  | `AI_PROVIDER=mock`      | `groq` (free) or `openai`              |
| Daily Remotive sync | Manual button           | Vercel Cron + `CRON_SECRET`            |

## Database schema

Apply migrations against Supabase from your laptop (the script baselines databases that were created with `db:push`):

```bash
mv .env.local .env.local.bak            # so the Supabase URL below wins
export DATABASE_URL='postgresql://postgres.<project>:<password>@aws-1-eu-central-1.pooler.supabase.com:6543/postgres'
npm run db:upgrade
npm run db:seed                         # optional sample catalog
unset DATABASE_URL && mv .env.local.bak .env.local
```

## Vercel environment variables

```bash
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://<your-app>.vercel.app
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
CRON_SECRET=<long random string>
# Optional social login
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Redeploy after changing variables.

## OAuth apps

- **GitHub** → Settings → Developer settings → OAuth Apps → New.
  Homepage `https://<your-app>.vercel.app`, callback `https://<your-app>.vercel.app/api/auth/callback/github`.
  GitHub allows one callback per app, so create a second app for `http://localhost:3000` if you want it locally.
- **Google** → Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application).
  Authorized redirect URIs: `https://<your-app>.vercel.app/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google`.
  Configure the consent screen (External, testing mode is fine for a demo; add your Google account as a test user).

## Important limitations

- Do **not** commit `.env.local` or real API keys.
- Avatars are stored as small data URLs in Postgres (resized client-side) — no file storage needed.
- PDF import needs text-based PDFs; scanned images have no extractable text.
- Exposing `/api/webhooks/jobs` publicly requires a strong secret.
- OpenAI usage is metered; Groq free tier is rate-limited.
