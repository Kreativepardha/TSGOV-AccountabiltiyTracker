/**
 * seed-discovery.ts
 *
 * One-time historical discovery pipeline for TSGOV.
 * Queries GDELT DOC 2.0 API and RSS feeds to find articles about
 * Telangana government promises/incidents since December 2023.
 * Outputs a review queue JSON file for editor triage.
 *
 * Run:
 *   TS_NODE_PROJECT=tsconfig.scripts.json node -r ts-node/register scripts/seed-discovery.ts
 */

import fs from "fs"
import path from "path"
import Parser from "rss-parser"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SuggestedType = "promise" | "incident" | "unknown"

interface QueueItem {
  title: string
  url: string
  outlet: string
  date: string
  source_type: "news_article" | "rss_feed" | "official_social" | "government_record"
  suggested_type: SuggestedType
  summary_excerpt: string
}

interface DiscoveryQueue {
  generated_at: string
  count: number
  items: QueueItem[]
}

// GDELT DOC 2.0 article list response shape (partial)
interface GdeltArticle {
  url: string
  title: string
  seendate: string    // e.g. "20240115T123000Z"
  domain: string
  sourcecountry?: string
  language?: string
}

interface GdeltResponse {
  articles?: GdeltArticle[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"

const RSS_FEEDS: { url: string; outlet: string }[] = [
  { url: "https://www.thehindu.com/news/national/telangana/feeder/default.rss", outlet: "The Hindu" },
  { url: "https://telanganatoday.com/feed",                                     outlet: "Telangana Today" },
  { url: "https://feeds.feedburner.com/ndtvnews-india-news",                    outlet: "NDTV" },
]

// Seed queries for GDELT covering different angles
const GDELT_QUERIES = [
  "telangana government promise scheme",
  "telangana government launch inaugurate",
  "telangana government scam corruption delay",
  "telangana government beneficiary disburse",
]

const SEED_START = "20231201000000" // 2023-12-01

const PROMISE_KEYWORDS = [
  "scheme", "guarantee", "inaugurate", "launch", "promise",
  "announce", "implement", "disburse", "beneficiary", "target",
]

const INCIDENT_KEYWORDS = [
  "delay", "scam", "protest", "fail", "pending",
  "arrest", "corruption", "allegation", "stuck", "stalled", "outage",
]

// ---------------------------------------------------------------------------
// Classification helper
// ---------------------------------------------------------------------------

function classifyText(text: string): SuggestedType {
  const lower = text.toLowerCase()
  const promiseScore = PROMISE_KEYWORDS.filter(k => lower.includes(k)).length
  const incidentScore = INCIDENT_KEYWORDS.filter(k => lower.includes(k)).length
  if (incidentScore > promiseScore) return "incident"
  if (promiseScore > 0) return "promise"
  return "unknown"
}

// ---------------------------------------------------------------------------
// Parse GDELT seendate → ISO string
// ---------------------------------------------------------------------------

function gdeltDateToIso(seendate: string): string {
  // Format: "20240115T123000Z" or "20240115T123000"
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
// GDELT fetcher
// ---------------------------------------------------------------------------

async function fetchGdeltBatch(query: string): Promise<QueueItem[]> {
  const params = new URLSearchParams({
    query: query,
    mode: "artlist",
    format: "json",
    maxrecords: "250",
    startdatetime: SEED_START,
  })
  const url = `${GDELT_BASE}?${params.toString()}`
  console.log(`  [GDELT] Fetching: "${query}"`)

  const res = await fetch(url, {
    headers: { "User-Agent": "TSGOV-SeedDiscovery/1.0 (+https://github.com/tsgov)" },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    console.warn(`  [GDELT] HTTP ${res.status} for query "${query}"`)
    return []
  }

  const data = (await res.json()) as GdeltResponse
  const articles = data.articles ?? []
  console.log(`  [GDELT] Got ${articles.length} articles for "${query}"`)

  return articles.map((a): QueueItem => ({
    title: a.title ?? "(no title)",
    url: a.url,
    outlet: a.domain,
    date: gdeltDateToIso(a.seendate),
    source_type: "news_article",
    suggested_type: classifyText(`${a.title}`),
    summary_excerpt: `[GDELT] ${a.domain} — ${a.seendate}`,
  }))
}

// ---------------------------------------------------------------------------
// RSS fetcher
// ---------------------------------------------------------------------------

async function fetchRssFeed(
  feedUrl: string,
  outlet: string,
  limit = 50,
): Promise<QueueItem[]> {
  const parser = new Parser({
    timeout: 20_000,
    headers: { "User-Agent": "TSGOV-SeedDiscovery/1.0" },
  })
  console.log(`  [RSS] Fetching: ${outlet} (${feedUrl})`)

  const feed = await parser.parseURL(feedUrl)
  const items = (feed.items ?? []).slice(0, limit)
  console.log(`  [RSS] Got ${items.length} items from ${outlet}`)

  return items
    .filter(item => item.link)
    .map((item): QueueItem => {
      const titleStr = item.title ?? "(no title)"
      const excerpt = (item.contentSnippet ?? item.content ?? "").slice(0, 200)
      return {
        title: titleStr,
        url: item.link!,
        outlet,
        date: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source_type: "rss_feed",
        suggested_type: classifyText(`${titleStr} ${excerpt}`),
        summary_excerpt: excerpt.trim() || `[${outlet} RSS]`,
      }
    })
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

function deduplicateByUrl(items: QueueItem[]): QueueItem[] {
  const seen = new Set<string>()
  const out: QueueItem[] = []
  for (const item of items) {
    const key = item.url.trim().toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      out.push(item)
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== TSGOV Seed Discovery ===")
  console.log(`Start date: ${SEED_START}`)
  console.log(`Generated at: ${new Date().toISOString()}\n`)

  const allItems: QueueItem[] = []

  // --- GDELT ---
  console.log("[1/2] Querying GDELT DOC 2.0 API...")
  for (const query of GDELT_QUERIES) {
    try {
      const items = await fetchGdeltBatch(query)
      allItems.push(...items)
    } catch (err) {
      console.warn(`  [GDELT] Failed for "${query}":`, (err as Error).message)
    }
  }

  // --- RSS ---
  console.log("\n[2/2] Fetching RSS feeds...")
  for (const feed of RSS_FEEDS) {
    try {
      const items = await fetchRssFeed(feed.url, feed.outlet)
      allItems.push(...items)
    } catch (err) {
      console.warn(`  [RSS] Failed for ${feed.outlet}:`, (err as Error).message)
    }
  }

  // --- Deduplicate ---
  console.log(`\nRaw total: ${allItems.length} items`)
  const unique = deduplicateByUrl(allItems)
  console.log(`After deduplication: ${unique.length} items`)

  // Sort newest first
  unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // --- Write output ---
  const queue: DiscoveryQueue = {
    generated_at: new Date().toISOString(),
    count: unique.length,
    items: unique,
  }

  const outPath = path.join(process.cwd(), "discovery-queue.json")
  fs.writeFileSync(outPath, JSON.stringify(queue, null, 2), "utf-8")
  console.log(`\nWrote discovery-queue.json → ${outPath}`)
  console.log(`Total items: ${unique.length}`)
  console.log(
    `  Promises: ${unique.filter(i => i.suggested_type === "promise").length}`,
  )
  console.log(
    `  Incidents: ${unique.filter(i => i.suggested_type === "incident").length}`,
  )
  console.log(
    `  Unknown:  ${unique.filter(i => i.suggested_type === "unknown").length}`,
  )
  console.log("\nDone. Review discovery-queue.json with an editor.")
}

main().catch(err => {
  console.error("Fatal:", err)
  process.exit(1)
})
