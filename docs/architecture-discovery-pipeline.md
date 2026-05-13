# TSGOV — Dynamic Discovery Pipeline Architecture

> **Status:** Proposed — decisions pending before implementation  
> **Supersedes:** Static file-based content model (Phase 1–7)

---

## Current vs Proposed

| | Current | Proposed |
|---|---|---|
| Content source | JSON/MD files in git | PostgreSQL database |
| Content entry | Manual PR | Discovery pipeline → admin review → DB |
| Rendering | Static export (Cloudflare Pages) | Server-rendered (Node.js runtime required) |
| Search | Pre-built FlexSearch JSON | DB query or Meilisearch |
| Discovery | None — fully manual | Automated multi-source pipeline |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Discovery Pipeline (cron, runs every 6h)                   │
│                                                             │
│  Sources:                                                   │
│    RSS        — The Hindu, NDTV, Deccan Chronicle,          │
│                 Telangana Today, Hans India                  │
│    GDELT      — DOC 2.0 API, keyword filter, no key needed  │
│    NewsAPI    — Article search, 100 req/day free            │
│    Twitter v2 — search/recent from official handles +       │
│                 keyword queries, Bearer token auth          │
│                                                             │
│  Process:                                                   │
│    fetch → deduplicate (URL match) → keyword-classify       │
│    → auto-suggest category + evidence_grade                 │
│    → POST /api/admin/ingest                                 │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL (Neon or Supabase)                              │
│                                                             │
│  discoveries                                                │
│    id, title, body_text, url, outlet, source_type          │
│    date, discovery_source, suggested_category              │
│    suggested_evidence_grade, suggested_type (promise|       │
│    incident|unknown), status (pending_review | approved     │
│    | rejected), reviewed_by, reviewed_at, archived_url      │
│    created_at                                               │
│                                                             │
│  promises         (published — mirrors current JSON schema) │
│  incidents        (published — mirrors current MD schema)   │
│  promise_updates  (normalised updates[] array)              │
│  sources          (normalised sources[] per entry)          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js (server-rendered — NOT static export)              │
│                                                             │
│  /admin                → review queue UI                    │
│    /admin/discoveries  → pending list, approve/reject/edit  │
│    /admin/promises     → manage published promises          │
│    /admin/incidents    → manage published incidents         │
│                                                             │
│  /api/admin/ingest     POST  — discovery pipeline writes here│
│  /api/admin/discoveries GET/PATCH — review actions          │
│  /api/admin/publish    POST  — approve discovery → content  │
│                                                             │
│  Public pages read from Prisma directly (no file I/O)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Discovery Sources Detail

### RSS Feeds
- The Hindu Telangana: `https://www.thehindu.com/news/national/telangana/feeder/default.rss`
- NDTV India: `https://feeds.feedburner.com/ndtvnews-india-news`
- Deccan Chronicle: check outlet RSS
- Telangana Today: `https://telanganatoday.com/feed`
- Hans India Telangana section
- **Library:** `rss-parser` (Node.js)
- **Rate limit:** None — poll every 6h max

### GDELT DOC 2.0 API
- Free, no API key
- Query: `telangana government promise scheme` with `sourcelang:eng` filter
- Returns article URLs + metadata
- Good for bulk discovery across regional outlets
- Docs: `https://api.gdeltproject.org/api/v2/doc/doc`

### NewsAPI
- REST endpoint: `GET https://newsapi.org/v2/everything`
- Query: `Telangana government OR "Congress Telangana" OR "Revanth Reddy"`
- Source filter: `the-hindu,ndtv`
- Free tier: 100 req/day, last 30 days only
- Requires `NEWSAPI_KEY` env var

### Twitter API v2
- Endpoint: `GET /2/tweets/search/recent`
- Auth: Bearer token (read-only, no user auth needed)
- Query examples:
  ```
  from:TelanganaCMO OR from:INCTelangana OR from:Revanth_AnilKumar
  lang:en -is:retweet
  ```
  ```
  (Telangana government scheme) lang:en -is:retweet
  ```
- Returns last 7 days, max 100 results/call
- **Free tier:** 500k reads/month, 1 req/15min on recent search
- Store `newest_id` per query to paginate — avoid re-fetching old tweets
- Requires `TWITTER_BEARER_TOKEN` env var
- Source type mapping: official handles → `official_social`, journalist accounts → `journalist_tweet`

---

## Discovery Pipeline Flow

```
1. Fetch from all sources
2. For each item:
   a. Normalise to common shape: { title, url, body, outlet, date, raw_source }
   b. Check URL against discoveries table — skip if exists (dedup)
   c. Keyword match against promise slugs → suggest related_promise
   d. Keyword classify: promise / incident / unknown
   e. Suggest evidence_grade based on source_type rules
   f. POST to /api/admin/ingest with API key header
3. Log: N new discoveries, M duplicates skipped
```

---

## Admin Review Flow

```
Editor opens /admin/discoveries
→ sees pending items sorted by date
→ for each item:
    - reads title, body, suggested category, suggested grade
    - edits fields as needed
    - clicks Approve as Promise | Approve as Incident | Reject
→ on Approve:
    - item status → "approved"
    - row inserted into promises or incidents table
    - discovery linked via discovery_id FK
→ on Reject:
    - item status → "rejected"
    - optional rejection reason stored
```

---

## Changes to Existing Codebase

| File | Change |
|---|---|
| `next.config.mjs` | Remove `output: "export"` |
| `lib/content.ts` | Replace `fs.readFileSync` with Prisma queries |
| `lib/schemas.ts` | Keep Zod — reuse for API input validation |
| `prisma/schema.prisma` | New — all tables |
| `app/api/admin/ingest/route.ts` | New — discovery pipeline writes here |
| `app/api/admin/discoveries/route.ts` | New — list/update discoveries |
| `app/admin/**` | New — review UI pages |
| `scripts/discovery-runner.ts` | New — polls all sources |
| `scripts/seed-db.ts` | New — imports existing JSON/MD seed into DB |
| Deployment | Cloudflare Pages → Vercel / Railway / Render |

---

## Open Decisions (needed before build)

| # | Decision | Options |
|---|---|---|
| 1 | **Hosting** | Vercel (easiest, free hobby tier) · Railway · Render · self-hosted |
| 2 | **Database** | Neon Postgres (free 0.5 GB) · Supabase (free, has REST API too) |
| 3 | **Admin auth** | API key header only · NextAuth (email/magic link) · Clerk |
| 4 | **Seed migration** | Import existing JSON/MD to DB on first deploy via `seed-db.ts` |
| 5 | **Twitter API tier** | Free (1 req/15min) · Basic $100/month (10k tweets/month, higher limits) |

---

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Admin API
ADMIN_API_KEY=...           # secret for pipeline → API auth

# Discovery sources
NEWSAPI_KEY=...
TWITTER_BEARER_TOKEN=...    # Bearer token from Twitter developer portal

# Optional
GDELT_ENABLED=true          # toggle individual sources
NEWSAPI_ENABLED=true
TWITTER_ENABLED=true
RSS_ENABLED=true
DISCOVERY_CRON_INTERVAL_HOURS=6
```

---

## Phase Plan (after decisions confirmed)

| PR | Title |
|---|---|
| PR-13 | `feat: add PostgreSQL + Prisma schema` |
| PR-14 | `feat: seed-db script — import existing content files` |
| PR-15 | `feat: migrate lib/content.ts to Prisma queries` |
| PR-16 | `feat: admin ingest API + API key auth` |
| PR-17 | `feat: admin review UI — discovery queue` |
| PR-18 | `feat: discovery runner — RSS + GDELT + NewsAPI` |
| PR-19 | `feat: discovery runner — Twitter API v2` |
| PR-20 | `feat: cron schedule for discovery runner` |
