# n8n automation (Milestone 4)

Local-only automation for ingesting a job listing into AI Job Radar.

## Safety

- n8n runs on `localhost:5678` via Docker Compose.
- Do **not** expose this instance to the public internet without auth and TLS.
- The app webhook requires `N8N_WEBHOOK_SECRET`.
- Notification is a **local stub** — nothing is emailed or posted to Slack automatically.

## Start

From the repo root (Next.js should already be running on port 3000):

```bash
cp .env.example .env.local   # if needed — set N8N_WEBHOOK_SECRET
npm run n8n:up
```

Open [http://localhost:5678](http://localhost:5678).

## Import the workflow

1. In n8n: **Workflows → Import from File**
2. Choose `n8n/workflows/job-ingest.json`
3. Open the **Persist + Analyze** node
4. Confirm header `x-webhook-secret` matches `N8N_WEBHOOK_SECRET` in `.env.local`
   (default in `.env.example`: `dev-n8n-secret-change-me`)
5. Confirm URL is `http://host.docker.internal:3000/api/webhooks/jobs`
   (Docker Desktop reaches the host Next.js app this way)

## Run end-to-end

1. Click **Execute workflow**
2. First run should create the job + analysis (`created: true`)
3. Execute again — duplicate prevention returns the same job (`duplicatePrevented: true`) without creating a second listing
4. Open the dashboard at [http://localhost:3000](http://localhost:3000) and find **Signal Forge**

## Curl equivalent (without the n8n UI)

```bash
curl -s -X POST http://localhost:3000/api/webhooks/jobs \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $N8N_WEBHOOK_SECRET" \
  -d @n8n/sample-job.json | jq
```

## Failure handling

| Case | Behavior |
| ---- | -------- |
| Missing/invalid secret | `401` |
| Invalid payload | `400` validation error |
| Duplicate job | `200` with existing job; analysis reused unless missing/`forceAnalyze` |
| AI/provider failure | `4xx/5xx` from analyze path; job may already be persisted on first create |

Re-run the workflow after fixing the failure. Duplicates will not create a second job row.
