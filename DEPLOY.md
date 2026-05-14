# TSGOV Deployment Guide

## What's set up (verified working)

- ✅ Neon Postgres DB (`ep-jolly-cell-aorazhxx`) — schema pushed, 20 promises + 10 incidents seeded
- ✅ NVIDIA Qwen3.5-397B classifier — `qwen/qwen3.5-397b-a17b` (tested working)
- ✅ Local dev: `npm run dev` reads from Neon directly via `.env.local`
- ✅ Production build: 50 routes, all green

## Deploy to Vercel

### 1. Push to GitHub

```bash
cd /home/pardha/Desktop/MASTER/PERSONAL/TSGOV
git init
git add .
git commit -m "feat: TSGOV accountability tracker with discovery pipeline"
git branch -M main

# Create a new repo on github.com first, then:
git remote add origin git@github.com:<your-username>/tsgov.git
git push -u origin main
```

### 2. Connect Vercel

1. Go to https://vercel.com/new
2. Import your `tsgov` GitHub repo
3. Framework Preset: **Next.js** (auto-detected)
4. Build command: leave default (`next build`)
5. Output directory: leave default (`.next`)

### 3. Add Environment Variables in Vercel

Settings → Environment Variables → add these for **Production** + **Preview**:

| Name | Value |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_UXyImx5foW7J@ep-jolly-cell-aorazhxx.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | (same as above) |
| `ADMIN_API_KEY` | Generate fresh: `openssl rand -hex 32` |
| `NEXT_PUBLIC_ADMIN_API_KEY` | (same as `ADMIN_API_KEY`) |
| `NVIDIA_API_KEY` | `nvapi-Q-Utjll...` (rotate this after exposed in chat!) |
| `NVIDIA_MODEL` | `qwen/qwen3.5-397b-a17b` |
| `SITE_URL` | `https://tsgov.vercel.app` (or custom domain) |
| `USE_DB` | `true` |

### 4. Deploy

Click **Deploy**. First build takes ~2 min. Site live at `https://tsgov-<hash>.vercel.app`.

### 5. Set up GitHub Actions cron (discovery pipeline)

GitHub repo → Settings → Secrets and variables → Actions → add:

- `ADMIN_API_KEY` (same as Vercel)
- `SITE_URL` (your Vercel URL)
- `NVIDIA_API_KEY` (your NVIDIA key)
- `NEWSAPI_KEY` (optional, skip if not have)
- `TWITTER_BEARER_TOKEN` (optional, skip if not have)

Workflow `.github/workflows/discovery-cron.yml` runs every 6 hours.
Trigger manually: Actions tab → "Discovery Pipeline" → "Run workflow".

## Run one-time historical seed (optional)

To pre-populate the discovery queue with all Telangana government articles since Dec 2023:

```bash
NVIDIA_API_KEY=your-key TS_NODE_PROJECT=tsconfig.scripts.json \
  node -r ts-node/register scripts/seed-discovery.ts
```

This queries GDELT (free, no key) + 3 RSS feeds, classifies via NVIDIA Qwen,
and writes results to `discovery-queue.json` (~100-200 items expected).

Then POST each item to your live `/api/admin/ingest` endpoint, OR import directly
to DB via a separate script if you want to skip the API roundtrip.

## API Keys you don't have (skip — pipeline still works)

| Key | Get from | Why skip is OK |
|---|---|---|
| `NEWSAPI_KEY` | https://newsapi.org/register | GDELT covers same articles for free |
| `TWITTER_BEARER_TOKEN` | https://developer.twitter.com (requires phone verification + free tier signup) | RSS feeds cover most official announcements |

You can add these later — runner gracefully skips sources when env var absent.

## Verification

After deploy, hit:
- `https://<your-url>/` — homepage with score card
- `https://<your-url>/dashboard` — full breakdown
- `https://<your-url>/api/promises` — JSON API
- `https://<your-url>/feed.xml` — RSS feed
- `https://<your-url>/admin` — admin overview (needs auth in production)

## SECURITY: rotate exposed credentials

Before going live, rotate these (exposed in chat):
1. Neon: console.neon.tech → Settings → Reset password
2. NVIDIA: build.nvidia.com → Account → API Keys → regenerate
3. GitHub OAuth (the one in your env example) → regenerate client secret

Update Vercel env vars + `.env.local` after rotation.
