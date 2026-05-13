/**
 * discovery-runner.ts
 *
 * Ongoing discovery pipeline for TSGOV.
 * Polls GDELT, RSS, NewsAPI, and Twitter API v2 for new articles about
 * Telangana government promises and incidents. Deduplicates by URL,
 * classifies each item, and POSTs new items to the admin ingest API.
 *
 * Designed to run as a cron job (e.g. every 6 hours).
 *
 * Required env vars:
 *   ADMIN_API_KEY          — X-Admin-Key header for the ingest endpoint
 *
 * Optional env vars (sources are skipped if keys absent):
 *   NEWSAPI_KEY            — NewsAPI.org key
 *   TWITTER_BEARER_TOKEN   — Twitter API v2 bearer token
 *   INGEST_BASE_URL        — base URL for ingest API (default: http://localhost:3000)
 *
 * Run:
 *   TS_NODE_PROJECT=tsconfig.scripts.json node -r ts-node/register scripts/discovery-runner.ts
 */

import fs from "fs"
import path from "path"
import Parser from "rss-parser"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SuggestedType = "promise" | "incident" | "unknown"
type SourceType =
  | "news_article"
  | "rss_feed"
  | "official_social"
  | "government_record"
type EvidenceGrade =
  | "Primary Evidence"
  | "Multiple Sources"
  | "Single Source"
  | "Allegation"
type DiscoverySource = "gdelt" | "rss" | "newsapi" | "twitter"

interface DiscoveredItem {
  title: string
  body_text: string
  url: string
  outlet: string
  source_type: SourceType
  date: string
  discovery_source: DiscoverySource
  suggested_category: string
  suggested_evidence_grade: EvidenceGrade
  suggested_type: SuggestedType
}

interface DiscoveryState {
  seen_urls: string[]
  twitter_newest_ids: Record<string, string>
}

// GDELT DOC 2.0 article list response
interface GdeltArticle {
  url: string
  title: string
  seendate: string
  domain: string
  sourcecountry?: string
  language?: string
}

interface GdeltResponse {
  articles?: GdeltArticle[]
}

// NewsAPI response
interface NewsApiArticle {
  url: string
  title: string | null
  description: string | null
  source: { name: string | null; id: string | null }
  publishedAt: string
}

interface NewsApiResponse {
  status: string
  articles?: NewsApiArticle[]
}

// Twitter API v2 response
interface TwitterTweet {
  id: string
  text: string
  created_at?: string
  author_id?: string
}

interface TwitterMeta {
  newest_id?: string
  oldest_id?: string
  result_count?: number
  next_token?: string
}

interface TwitterResponse {
  data?: TwitterTweet[]
  meta?: TwitterMeta
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"
const INGEST_BASE = (process.env.INGEST_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const STATE_FILE = path.join(process.cwd(), ".discovery-state.json")

// Look back 24 h by default for GDELT incremental pulls
const GDELT_LOOKBACK_HOURS = 24

const RSS_FEEDS: { url: string; outlet: string }[] = [
  { url: "https://www.thehindu.com/news/national/telangana/feeder/default.rss", outlet: "The Hindu" },
  { url: "https://telanganatoday.com/feed",                                     outlet: "Telangana Today" },
  { url: "https://feeds.feedburner.com/ndtvnews-india-news",                    outlet: "NDTV" },
]

const NEWSAPI_QUERIES = [
  "Telangana government scheme",
  "Telangana government promise",
  "Telangana corruption protest",
]

const TWITTER_QUERIES: { query: string; key: string }[] = [
  {
    query: "from:TelanganaCMO OR from:INCTelangana lang:en -is:retweet",
    key: "TelanganaCMO_INCTelangana",
  },
]

const PROMISE_KEYWORDS = [
  "scheme", "guarantee", "inaugurate", "launch", "promise",
  "announce", "implement", "disburse", "beneficiary", "target",
]

const INCIDENT_KEYWORDS = [
  "delay", "scam", "protest", "fail", "pending",
  "arrest", "corruption", "allegation", "stuck", "stalled", "outage",
]

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

function loadState(): DiscoveryState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, "utf-8")
      return JSON.parse(raw) as DiscoveryState
    }
  } catch (err) {
    console.warn("[state] Could not load state file, starting fresh:", (err as Error).message)
  }
  return { seen_urls: [], twitter_newest_ids: {} }
}

function saveState(state: DiscoveryState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8")
}

// ---------------------------------------------------------------------------
// Classification helpers
// ---------------------------------------------------------------------------

function classifyText(text: string): SuggestedType {
  const lower = text.toLowerCase()
  const promiseScore = PROMISE_KEYWORDS.filter(k => lower.includes(k)).length
  const incidentScore = INCIDENT_KEYWORDS.filter(k => lower.includes(k)).length
  if (incidentScore > promiseScore) return "incident"
  if (promiseScore > 0) return "promise"
  return "unknown"
}

function suggestCategory(type: SuggestedType): string {
  if (type === "promise") return "Government Scheme"
  if (type === "incident") return "Accountability"
  return "General"
}

function suggestEvidenceGrade(
  sourceType: SourceType,
  discoverySource: DiscoverySource,
  independentSourceCount = 1,
): EvidenceGrade {
  if (sourceType === "official_social" || sourceType === "government_record") {
    return "Primary Evidence"
  }
  if (independentSourceCount >= 3) return "Multiple Sources"
  if (discoverySource === "twitter") return "Allegation"
  return "Single Source"
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function formatGdeltDateTime(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0")
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}`
  )
}

function gdeltDateToIso(seendate: string): string {
  const clean = seendate.replace("T", "").replace("Z", "").replace(/-/g, "")
  const y = clean.slice(0, 4)
  const mo = clean.slice(4, 6)
  const d = clean.slice(6, 8)
  const h = clean.slice(8, 10) || "00"
  const mi = clean.slice(10, 12) || "00"
  const s = clean.slice(12, 14) || "00"
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`
}

// ---------------------------------------------------------------------------
// Source fetchers (all exported)
// ---------------------------------------------------------------------------

/** Fetch recent articles from GDELT DOC 2.0 API. */
export async function fetchGdelt(): Promise<DiscoveredItem[]> {
  const lookbackMs = GDELT_LOOKBACK_HOURS * 60 * 60 * 1000
  const startDate = new Date(Date.now() - lookbackMs)
  const startDatetime = formatGdeltDateTime(startDate)

  const queries = [
    "telangana government promise scheme",
    "telangana government launch inaugurate",
    "telangana government scam corruption delay",
  ]

  const results: DiscoveredItem[] = []

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        query,
        mode: "artlist",
        format: "json",
        maxrecords: "250",
        startdatetime: startDatetime,
      })
      const url = `${GDELT_BASE}?${params.toString()}`
      const res = await fetch(url, {
        headers: { "User-Agent": "TSGOV-DiscoveryRunner/1.0" },
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) {
        console.warn(`[gdelt] HTTP ${res.status} for query "${query}"`)
        continue
      }
      const data = (await res.json()) as GdeltResponse
      for (const a of data.articles ?? []) {
        const text = a.title ?? ""
        const type = classifyText(text)
        results.push({
          title: a.title ?? "(no title)",
          body_text: `GDELT article from ${a.domain}. Seen: ${a.seendate}.`,
          url: a.url,
          outlet: a.domain,
          source_type: "news_article",
          date: gdeltDateToIso(a.seendate),
          discovery_source: "gdelt",
          suggested_category: suggestCategory(type),
          suggested_evidence_grade: suggestEvidenceGrade("news_article", "gdelt"),
          suggested_type: type,
        })
      }
    } catch (err) {
      console.warn(`[gdelt] Failed for "${query}":`, (err as Error).message)
    }
  }

  return results
}

/** Fetch latest items from all configured RSS feeds. */
export async function fetchRss(): Promise<DiscoveredItem[]> {
  const parser = new Parser({
    timeout: 20_000,
    headers: { "User-Agent": "TSGOV-DiscoveryRunner/1.0" },
  })
  const results: DiscoveredItem[] = []

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url)
      for (const item of parsed.items ?? []) {
        if (!item.link) continue
        const text = `${item.title ?? ""} ${item.contentSnippet ?? ""}`
        const type = classifyText(text)
        const excerpt = (item.contentSnippet ?? item.content ?? "").slice(0, 500).trim()
        results.push({
          title: item.title ?? "(no title)",
          body_text: excerpt || `[${feed.outlet}] ${item.link}`,
          url: item.link,
          outlet: feed.outlet,
          source_type: "rss_feed",
          date: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
          discovery_source: "rss",
          suggested_category: suggestCategory(type),
          suggested_evidence_grade: suggestEvidenceGrade("rss_feed", "rss"),
          suggested_type: type,
        })
      }
    } catch (err) {
      console.warn(`[rss] Failed for ${feed.outlet}:`, (err as Error).message)
    }
  }

  return results
}

/** Fetch articles from NewsAPI (requires NEWSAPI_KEY env var). */
export async function fetchNewsApi(): Promise<DiscoveredItem[]> {
  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) {
    console.log("[newsapi] NEWSAPI_KEY not set — skipping")
    return []
  }

  const results: DiscoveredItem[] = []

  for (const q of NEWSAPI_QUERIES) {
    try {
      const params = new URLSearchParams({
        q,
        apiKey,
        language: "en",
        sortBy: "publishedAt",
        pageSize: "100",
      })
      const url = `https://newsapi.org/v2/everything?${params.toString()}`
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) {
        console.warn(`[newsapi] HTTP ${res.status} for query "${q}"`)
        continue
      }
      const data = (await res.json()) as NewsApiResponse
      if (data.status !== "ok") {
        console.warn(`[newsapi] Non-ok status for "${q}"`)
        continue
      }
      for (const a of data.articles ?? []) {
        if (!a.url) continue
        const text = `${a.title ?? ""} ${a.description ?? ""}`
        const type = classifyText(text)
        results.push({
          title: a.title ?? "(no title)",
          body_text: a.description ?? "",
          url: a.url,
          outlet: a.source.name ?? "NewsAPI",
          source_type: "news_article",
          date: a.publishedAt ?? new Date().toISOString(),
          discovery_source: "newsapi",
          suggested_category: suggestCategory(type),
          suggested_evidence_grade: suggestEvidenceGrade("news_article", "newsapi"),
          suggested_type: type,
        })
      }
    } catch (err) {
      console.warn(`[newsapi] Failed for "${q}":`, (err as Error).message)
    }
  }

  return results
}

/**
 * Fetch recent tweets from Twitter API v2 (requires TWITTER_BEARER_TOKEN env var).
 * Reads/writes newest_id per query from state to avoid re-fetching.
 */
export async function fetchTwitter(state: DiscoveryState): Promise<{
  items: DiscoveredItem[]
  updatedState: DiscoveryState
}> {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN
  if (!bearerToken) {
    console.log("[twitter] TWITTER_BEARER_TOKEN not set — skipping")
    return { items: [], updatedState: state }
  }

  const results: DiscoveredItem[] = []
  const updatedState: DiscoveryState = {
    seen_urls: [...state.seen_urls],
    twitter_newest_ids: { ...state.twitter_newest_ids },
  }

  for (const { query, key } of TWITTER_QUERIES) {
    try {
      const params = new URLSearchParams({
        query,
        max_results: "100",
        "tweet.fields": "created_at,author_id,entities",
      })

      const sinceId = state.twitter_newest_ids[key]
      if (sinceId) {
        params.set("since_id", sinceId)
      }

      const url = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        signal: AbortSignal.timeout(20_000),
      })

      if (!res.ok) {
        console.warn(`[twitter] HTTP ${res.status} for query "${key}"`)
        continue
      }

      const data = (await res.json()) as TwitterResponse

      if (data.meta?.newest_id) {
        updatedState.twitter_newest_ids[key] = data.meta.newest_id
      }

      for (const tweet of data.data ?? []) {
        const type = classifyText(tweet.text)
        const tweetUrl = `https://twitter.com/i/web/status/${tweet.id}`
        results.push({
          title: tweet.text.slice(0, 120),
          body_text: tweet.text,
          url: tweetUrl,
          outlet: "Twitter",
          source_type: "official_social",
          date: tweet.created_at ?? new Date().toISOString(),
          discovery_source: "twitter",
          suggested_category: suggestCategory(type),
          suggested_evidence_grade: suggestEvidenceGrade("official_social", "twitter"),
          suggested_type: type,
        })
      }
    } catch (err) {
      console.warn(`[twitter] Failed for query "${key}":`, (err as Error).message)
    }
  }

  return { items: results, updatedState }
}

// ---------------------------------------------------------------------------
// Ingest API caller
// ---------------------------------------------------------------------------

async function postToIngest(item: DiscoveredItem): Promise<boolean> {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    console.warn("[ingest] ADMIN_API_KEY not set — cannot POST items")
    return false
  }

  try {
    const res = await fetch(`${INGEST_BASE}/api/admin/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Key": adminKey,
      },
      body: JSON.stringify(item),
      signal: AbortSignal.timeout(15_000),
    })
    if (!res.ok) {
      console.warn(`[ingest] HTTP ${res.status} for URL: ${item.url}`)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[ingest] Failed to POST "${item.title}":`, (err as Error).message)
    return false
  }
}

// ---------------------------------------------------------------------------
// Main runner (exported for programmatic use)
// ---------------------------------------------------------------------------

export async function runDiscovery(): Promise<void> {
  console.log(`[discovery] Starting run at ${new Date().toISOString()}`)

  // Load persisted state
  const state = loadState()
  const seenUrls = new Set<string>(state.seen_urls.map(u => u.trim().toLowerCase()))

  // Fetch from all sources
  console.log("[discovery] Fetching from GDELT...")
  const gdeltItems = await fetchGdelt().catch(err => {
    console.error("[discovery] GDELT fetch failed:", (err as Error).message)
    return [] as DiscoveredItem[]
  })

  console.log("[discovery] Fetching from RSS feeds...")
  const rssItems = await fetchRss().catch(err => {
    console.error("[discovery] RSS fetch failed:", (err as Error).message)
    return [] as DiscoveredItem[]
  })

  console.log("[discovery] Fetching from NewsAPI...")
  const newsApiItems = await fetchNewsApi().catch(err => {
    console.error("[discovery] NewsAPI fetch failed:", (err as Error).message)
    return [] as DiscoveredItem[]
  })

  console.log("[discovery] Fetching from Twitter...")
  const { items: twitterItems, updatedState } = await fetchTwitter(state).catch(err => {
    console.error("[discovery] Twitter fetch failed:", (err as Error).message)
    return { items: [] as DiscoveredItem[], updatedState: state }
  })

  const allItems = [...gdeltItems, ...rssItems, ...newsApiItems, ...twitterItems]
  console.log(`[discovery] Total fetched (before dedup): ${allItems.length}`)

  // Deduplicate
  let newCount = 0
  let skippedCount = 0
  let ingestedCount = 0
  const newUrls: string[] = []

  for (const item of allItems) {
    const key = item.url.trim().toLowerCase()
    if (seenUrls.has(key)) {
      skippedCount++
      continue
    }
    seenUrls.add(key)
    newUrls.push(item.url.trim())
    newCount++

    const ok = await postToIngest(item)
    if (ok) ingestedCount++
  }

  // Persist updated state
  const finalState: DiscoveryState = {
    seen_urls: [...updatedState.seen_urls, ...newUrls],
    twitter_newest_ids: updatedState.twitter_newest_ids,
  }
  saveState(finalState)

  console.log(
    `[discovery] Done. Found ${newCount} new items, skipped ${skippedCount} duplicates.` +
    (process.env.ADMIN_API_KEY ? ` Ingested: ${ingestedCount}/${newCount}.` : " (ADMIN_API_KEY not set, nothing ingested)"),
  )
}

// ---------------------------------------------------------------------------
// Entry point (when run directly)
// ---------------------------------------------------------------------------

// Detect direct execution under ts-node / compiled JS
if (require.main === module) {
  runDiscovery().catch(err => {
    console.error("[discovery] Fatal error:", err)
    process.exit(1)
  })
}
