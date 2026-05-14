/**
 * scrape-myneta.ts — One-time scraper for Telangana 2023 Assembly MLA data.
 *
 * Data source: https://myneta.info/Telangana2023/ (Association for Democratic
 * Reforms — ADR). ADR publishes candidate self-sworn affidavit data that
 * candidates file with the Election Commission of India under Supreme Court
 * directives in PUCL v. UoI (2003). The compiled dataset on myneta.info is
 * released under CC-BY (see site footer) and is intended for public, educational,
 * and journalistic use.
 *
 * USAGE
 * -----
 * Run ONCE to populate the local Politician / CriminalCase / AssetDeclaration
 * tables, then re-run as ADR publishes new affidavits (typically annually as
 * MLAs file disclosure updates or after by-elections):
 *
 *   TS_NODE_PROJECT=tsconfig.scripts.json \
 *     node -r ts-node/register scripts/scrape-myneta.ts
 *
 * The script writes two artifacts to scripts/:
 *   - myneta-telangana-2023.raw.json    (verbatim scraped fields per MLA)
 *   - myneta-telangana-2023.json        (SQL-shaped objects for Prisma upsert)
 *
 * Citation requirement: EVERY downstream record MUST keep `source_url` pointing
 * back to the originating myneta.info candidate page. The site terms and ADR's
 * licensing both require attribution; our public UI is expected to link out
 * for each politician page.
 *
 * Politeness: 2-second floor between requests, custom User-Agent, partial-progress
 * checkpointing every 20 candidates so a crash never loses more than a minute.
 * Do not remove the rate limit.
 */

import * as fs from "fs"
import * as path from "path"
import * as cheerio from "cheerio"

// ─── Config ─────────────────────────────────────────────────────────────────

const INDEX_URL =
  "https://myneta.info/Telangana2023/index.php?action=show_winners&sort=default"
const BASE_URL = "https://myneta.info/Telangana2023/"
const USER_AGENT = "TSGOV-AccountabilityTracker/1.0 (educational research)"
const REQUEST_DELAY_MS = 2000
const CHECKPOINT_EVERY = 20

const OUT_DIR = path.join(process.cwd(), "scripts")
const RAW_OUT = path.join(OUT_DIR, "myneta-telangana-2023.raw.json")
const SQL_OUT = path.join(OUT_DIR, "myneta-telangana-2023.json")

// ─── Constituency → District mapping (Telangana, 119 ACs) ───────────────────
// Incomplete entries fall back to null (caller may enrich later).
const TELANGANA_DISTRICTS: Record<string, string> = {
  // Hyderabad
  Goshamahal: "Hyderabad",
  Charminar: "Hyderabad",
  Chandrayangutta: "Hyderabad",
  Yakutpura: "Hyderabad",
  Bahadurpura: "Hyderabad",
  Malakpet: "Hyderabad",
  Karwan: "Hyderabad",
  Nampally: "Hyderabad",
  Jubilee_Hills: "Hyderabad",
  "Jubilee Hills": "Hyderabad",
  Khairatabad: "Hyderabad",
  Sanathnagar: "Hyderabad",
  Amberpet: "Hyderabad",
  Musheerabad: "Hyderabad",
  Secunderabad: "Hyderabad",
  "Secunderabad Cantonment": "Hyderabad",
  // Ranga Reddy / Medchal / Hyderabad-adjacent
  LB_Nagar: "Ranga Reddy",
  "LB Nagar": "Ranga Reddy",
  Maheshwaram: "Ranga Reddy",
  Rajendranagar: "Ranga Reddy",
  Serilingampally: "Ranga Reddy",
  Chevella: "Ranga Reddy",
  Pargi: "Vikarabad",
  Vikarabad: "Vikarabad",
  Tandur: "Vikarabad",
  Ibrahimpatnam: "Ranga Reddy",
  Kalwakurthy: "Nagarkurnool",
  Shadnagar: "Ranga Reddy",
  Kukatpally: "Medchal-Malkajgiri",
  Quthbullapur: "Medchal-Malkajgiri",
  Uppal: "Medchal-Malkajgiri",
  Malkajgiri: "Medchal-Malkajgiri",
  Medchal: "Medchal-Malkajgiri",
  // Sangareddy / Medak / Siddipet
  Sangareddy: "Sangareddy",
  Patancheru: "Sangareddy",
  Narsapur: "Medak",
  Andole: "Sangareddy",
  Zaheerabad: "Sangareddy",
  Medak: "Medak",
  Siddipet: "Siddipet",
  Dubbak: "Siddipet",
  Gajwel: "Siddipet",
  Husnabad: "Siddipet",
  // Karimnagar / Jagtial / Peddapalli / Rajanna Sircilla
  Karimnagar: "Karimnagar",
  Choppadandi: "Karimnagar",
  Manakondur: "Karimnagar",
  Huzurabad: "Karimnagar",
  Jagtial: "Jagtial",
  Dharmapuri: "Jagtial",
  Korutla: "Jagtial",
  Sircilla: "Rajanna Sircilla",
  Vemulawada: "Rajanna Sircilla",
  Peddapalli: "Peddapalli",
  Manthani: "Peddapalli",
  Ramagundam: "Peddapalli",
  // Adilabad / Nirmal / Mancherial / Asifabad
  Adilabad: "Adilabad",
  Boath: "Adilabad",
  Khanapur: "Nirmal",
  Nirmal: "Nirmal",
  Mudhole: "Nirmal",
  Sirpur: "Komaram Bheem Asifabad",
  Chennur: "Mancherial",
  Bellampalli: "Mancherial",
  Mancherial: "Mancherial",
  Asifabad: "Komaram Bheem Asifabad",
  // Nizamabad / Kamareddy
  Nizamabad_Urban: "Nizamabad",
  "Nizamabad Urban": "Nizamabad",
  Nizamabad_Rural: "Nizamabad",
  "Nizamabad Rural": "Nizamabad",
  Bodhan: "Nizamabad",
  Armoor: "Nizamabad",
  Balkonda: "Nizamabad",
  Jukkal: "Kamareddy",
  Banswada: "Kamareddy",
  Yellareddy: "Kamareddy",
  Kamareddy: "Kamareddy",
  // Warangal / Hanamkonda / Jangaon / Mahabubabad / Jayashankar Bhupalpally / Mulugu
  Warangal_East: "Hanumakonda",
  "Warangal East": "Hanumakonda",
  Warangal_West: "Hanumakonda",
  "Warangal West": "Hanumakonda",
  Wardhannapet: "Warangal",
  Parkal: "Hanumakonda",
  Bhupalpalle: "Jayashankar Bhupalpally",
  Mulugu: "Mulugu",
  Mahabubabad: "Mahabubabad",
  Narsampet: "Warangal",
  Pinapaka: "Bhadradri Kothagudem",
  Yellandu: "Bhadradri Kothagudem",
  Dornakal: "Mahabubabad",
  Jangaon: "Jangaon",
  Ghanpur: "Jangaon",
  "Station Ghanpur": "Jangaon",
  Palakurthi: "Jangaon",
  // Khammam / Bhadradri Kothagudem
  Khammam: "Khammam",
  Palair: "Khammam",
  Madhira: "Khammam",
  Wyra: "Khammam",
  Sathupalle: "Khammam",
  Kothagudem: "Bhadradri Kothagudem",
  Aswaraopeta: "Bhadradri Kothagudem",
  // Nalgonda / Suryapet / Yadadri Bhuvanagiri
  Nalgonda: "Nalgonda",
  Munugode: "Nalgonda",
  Nagarjuna_Sagar: "Nalgonda",
  "Nagarjuna Sagar": "Nalgonda",
  Miryalaguda: "Nalgonda",
  Devarakonda: "Nalgonda",
  Nakrekal: "Nalgonda",
  Suryapet: "Suryapet",
  Kodad: "Suryapet",
  Huzurnagar: "Suryapet",
  Thungaturthy: "Suryapet",
  Bhongir: "Yadadri Bhuvanagiri",
  Alair: "Yadadri Bhuvanagiri",
  // Mahbubnagar / Wanaparthy / Jogulamba Gadwal / Nagarkurnool / Narayanpet
  Mahabubnagar: "Mahabubnagar",
  Devarakadra: "Mahabubnagar",
  Makthal: "Narayanpet",
  Narayanpet: "Narayanpet",
  Kodangal: "Vikarabad",
  Achampet: "Nagarkurnool",
  Nagarkurnool: "Nagarkurnool",
  Kollapur: "Nagarkurnool",
  Wanaparthy: "Wanaparthy",
  Gadwal: "Jogulamba Gadwal",
  Alampur: "Jogulamba Gadwal",
}

// ─── Type definitions ──────────────────────────────────────────────────────

interface IndexRow {
  serial: string
  name: string
  party: string
  constituency: string
  candidateUrl: string
}

interface CriminalCaseRaw {
  case_type: string
  ipc_sections: string[]
  status: string
  summary: string
  is_serious: boolean
}

interface ScrapedMLA {
  name: string
  party: string
  constituency: string
  myneta_url: string
  age: number | null
  education: string | null
  profession: string | null
  photo_url: string | null
  criminal_cases: CriminalCaseRaw[]
  total_cases: number
  serious_case_count: number
  total_assets_inr: number | null
  total_assets_raw: string | null
  total_liabilities_inr: number | null
  liabilities_raw: string | null
  parse_errors: string[]
}

interface SqlPolitician {
  slug: string
  name: string
  party: string
  constituency: string
  position: "MLA"
  election_cycle: "2023-Congress"
  district: string | null
  age: number | null
  education: string | null
  profession: string | null
  photo_url: string | null
  myneta_url: string
  criminal_cases: Array<{
    case_type: string
    ipc_sections: string[]
    status: string
    summary: string
    is_serious: boolean
    source_url: string
  }>
  asset_declaration: {
    year: "2023"
    total_assets_inr: number | null
    liabilities_inr: number | null
    source_url: string
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,'"`’]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function districtFor(constituency: string): string | null {
  const key = constituency.trim()
  if (TELANGANA_DISTRICTS[key]) return TELANGANA_DISTRICTS[key]
  // try case-insensitive
  const lower = key.toLowerCase()
  for (const k of Object.keys(TELANGANA_DISTRICTS)) {
    if (k.toLowerCase() === lower) return TELANGANA_DISTRICTS[k]
  }
  return null
}

/**
 * Parse "Rs 1,23,45,678" or "Rs 5 Crore+", "Rs 23 Lakhs", "₹ 50,00,000".
 * Returns rupees as a plain integer, or null when no number is recoverable.
 */
export function parseRupees(text: string | null | undefined): number | null {
  if (!text) return null
  const cleaned = text.replace(/[^\d.,a-zA-Z+\s]/g, " ").trim()
  if (!cleaned) return null

  // crore / lakh / thousand multipliers
  const croreMatch = cleaned.match(/([\d.]+)\s*(crore|cr)/i)
  if (croreMatch) {
    const n = parseFloat(croreMatch[1])
    if (!isNaN(n)) return Math.round(n * 1_00_00_000)
  }
  const lakhMatch = cleaned.match(/([\d.]+)\s*(lakh|lac)/i)
  if (lakhMatch) {
    const n = parseFloat(lakhMatch[1])
    if (!isNaN(n)) return Math.round(n * 1_00_000)
  }
  const thouMatch = cleaned.match(/([\d.]+)\s*(thousand|thou)/i)
  if (thouMatch) {
    const n = parseFloat(thouMatch[1])
    if (!isNaN(n)) return Math.round(n * 1_000)
  }

  // Fallback: take the first comma-grouped digit sequence (e.g. "1,23,45,678")
  const digitMatch = cleaned.match(/([\d,]+)/)
  if (digitMatch) {
    const n = parseInt(digitMatch[1].replace(/,/g, ""), 10)
    if (!isNaN(n) && n > 0) return n
  }
  return null
}

/**
 * Detect "serious" criminal cases — myneta exposes a flag, but as a safety net
 * we also pattern-match for the standard >5yr punishment markers in the body.
 */
export function isSeriousCase(blob: string): boolean {
  const s = blob.toLowerCase()
  if (s.includes("serious")) return true
  if (/imprisonment\s+of\s+(\d+)\s+years/.test(s)) {
    const m = s.match(/imprisonment\s+of\s+(\d+)\s+years/)
    if (m && parseInt(m[1], 10) >= 5) return true
  }
  // Heuristic: IPC sections widely understood as serious (302 murder, 376 rape,
  // 307 attempt to murder, 395/396/397 dacoity, 354 outraging modesty, 498A).
  const seriousIpc = ["302", "307", "376", "395", "396", "397", "354", "498a"]
  for (const sec of seriousIpc) {
    if (new RegExp(`\\bipc[^a-z0-9]*${sec}\\b`, "i").test(s)) return true
    if (new RegExp(`section[^a-z0-9]*${sec}\\b`, "i").test(s)) return true
  }
  return false
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
    },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`)
  }
  return await res.text()
}

// ─── Index parsing ──────────────────────────────────────────────────────────

export function parseIndex(html: string): IndexRow[] {
  const $ = cheerio.load(html)
  const rows: IndexRow[] = []

  // myneta winners table has rows with candidate name as the first link
  $("table tr").each((_, tr) => {
    const cells = $(tr).find("td")
    if (cells.length < 3) return

    // First link in row points to the candidate page
    const link = $(tr).find("a[href*='candidate.php']").first()
    if (!link.length) return

    const href = link.attr("href")
    if (!href) return

    const name = link.text().trim()
    if (!name) return

    const tds = cells.toArray().map(td => $(td).text().trim())
    // Heuristic column extraction — myneta layout has changed historically, so
    // we accept either {serial, name, constituency, party} or {name, party, constituency}.
    let serial = ""
    let constituency = ""
    let party = ""

    if (/^\d+$/.test(tds[0] ?? "")) {
      serial = tds[0]
      // tds[1] usually contains the link text; the remaining tds hold constituency/party.
      constituency = tds[2] ?? ""
      party = tds[3] ?? ""
    } else {
      constituency = tds[1] ?? ""
      party = tds[2] ?? ""
    }

    const candidateUrl = href.startsWith("http") ? href : BASE_URL + href
    rows.push({ serial, name, party, constituency, candidateUrl })
  })

  return rows
}

// ─── Candidate page parsing ────────────────────────────────────────────────

function textOf($: cheerio.CheerioAPI, sel: string): string {
  return $(sel).text().replace(/\s+/g, " ").trim()
}

/**
 * Find the value cell whose label contains `label` (case-insensitive).
 * myneta tables typically use two-column rows: <td>Label</td><td>Value</td>.
 */
function valueByLabel($: cheerio.CheerioAPI, label: string): string | null {
  const re = new RegExp(label, "i")
  let found: string | null = null
  $("table tr").each((_, tr) => {
    const tds = $(tr).find("td")
    if (tds.length < 2) return
    const labelText = $(tds[0]).text().trim()
    if (re.test(labelText)) {
      found = $(tds[1]).text().replace(/\s+/g, " ").trim()
      return false // break
    }
  })
  return found
}

export function parseCandidate(html: string, url: string): Partial<ScrapedMLA> {
  const $ = cheerio.load(html)
  const errors: string[] = []

  // --- Header: name + party + constituency ---
  const headingText = textOf($, "h2, h3, .candidate_name, .heading")
  const titleText = textOf($, "title")

  // --- Personal: age, education, profession ---
  const ageRaw =
    valueByLabel($, "^age$") ??
    valueByLabel($, "age\\s") ??
    valueByLabel($, "\\bage\\b")
  let age: number | null = null
  if (ageRaw) {
    const m = ageRaw.match(/(\d+)/)
    if (m) age = parseInt(m[1], 10)
  } else {
    errors.push("age:not-found")
  }

  const education =
    valueByLabel($, "self.?profess.?education") ??
    valueByLabel($, "educational") ??
    valueByLabel($, "education")
  const profession =
    valueByLabel($, "profession") ?? valueByLabel($, "occupation")

  // --- Photo ---
  const photoSrc = $("img[src*='photo'], img[src*='candidate']").first().attr("src")
  const photo_url = photoSrc
    ? photoSrc.startsWith("http")
      ? photoSrc
      : BASE_URL + photoSrc.replace(/^\.\//, "")
    : null

  // --- Criminal cases ---
  const cases: CriminalCaseRaw[] = []
  // myneta puts each case in a table or numbered block. Look for headings like
  // "Case Details(1)" / "Charges Framed By Court" / "IPC Sections Applicable"
  $("table").each((_, tbl) => {
    const tblText = $(tbl).text()
    if (!/ipc|charges|case\s*details|cognizable/i.test(tblText)) return

    const ipcMatches = Array.from(
      tblText.matchAll(/(?:IPC|section[s]?)\s*-?\s*(\d{2,4}[A-Za-z]?)/gi)
    ).map(m => m[1])
    if (!ipcMatches.length) return

    const statusMatch = tblText.match(
      /(charges?\s+framed|chargesheet\s+filed|fir|under\s+investigation|conviction|acquitted|stayed)/i
    )
    const status = statusMatch ? statusMatch[1] : "unknown"

    const summary = tblText.replace(/\s+/g, " ").trim().slice(0, 500)

    cases.push({
      case_type: "criminal",
      ipc_sections: Array.from(new Set(ipcMatches)),
      status,
      summary,
      is_serious: isSeriousCase(tblText),
    })
  })

  // Top-line totals — myneta usually shows "Number of Criminal Cases: N" and
  // "Number of serious IPC Cases: N" near the top of the page.
  let total_cases = cases.length
  const declaredTotal = $('body')
    .text()
    .match(/number\s+of\s+criminal\s+cases\s*[:\-]?\s*(\d+)/i)
  if (declaredTotal) {
    const n = parseInt(declaredTotal[1], 10)
    if (!isNaN(n)) total_cases = n
  }

  let serious_case_count = cases.filter(c => c.is_serious).length
  const declaredSerious = $('body')
    .text()
    .match(/serious\s+(?:ipc\s+)?cases?\s*[:\-]?\s*(\d+)/i)
  if (declaredSerious) {
    const n = parseInt(declaredSerious[1], 10)
    if (!isNaN(n)) serious_case_count = n
  }

  // --- Assets & Liabilities ---
  // Totals usually shown as "Totals" row at bottom of assets table, or in a
  // "Total Assets" / "Liabilities" row.
  const totalAssetsRaw =
    valueByLabel($, "totals?\\s*$") ??
    valueByLabel($, "total\\s+assets") ??
    valueByLabel($, "movable\\s*\\+\\s*immovable")
  const liabRaw =
    valueByLabel($, "total\\s+liab") ?? valueByLabel($, "liabilities")

  const total_assets_inr = parseRupees(totalAssetsRaw)
  const total_liabilities_inr = parseRupees(liabRaw)

  if (total_assets_inr == null) errors.push("assets:not-parsed")
  if (total_liabilities_inr == null) errors.push("liabilities:not-parsed")

  return {
    myneta_url: url,
    age,
    education: education || null,
    profession: profession || null,
    photo_url,
    criminal_cases: cases,
    total_cases,
    serious_case_count,
    total_assets_inr,
    total_assets_raw: totalAssetsRaw || null,
    total_liabilities_inr,
    liabilities_raw: liabRaw || null,
    parse_errors: errors,
  }
}

// ─── SQL shape builder ─────────────────────────────────────────────────────

export function toSqlShape(raw: ScrapedMLA): SqlPolitician {
  return {
    slug: slugify(raw.name),
    name: raw.name,
    party: raw.party,
    constituency: raw.constituency,
    position: "MLA",
    election_cycle: "2023-Congress",
    district: districtFor(raw.constituency),
    age: raw.age,
    education: raw.education,
    profession: raw.profession,
    photo_url: raw.photo_url,
    myneta_url: raw.myneta_url,
    criminal_cases: raw.criminal_cases.map(c => ({
      case_type: c.case_type,
      ipc_sections: c.ipc_sections,
      status: c.status,
      summary: c.summary,
      is_serious: c.is_serious,
      source_url: raw.myneta_url,
    })),
    asset_declaration: {
      year: "2023",
      total_assets_inr: raw.total_assets_inr,
      liabilities_inr: raw.total_liabilities_inr,
      source_url: raw.myneta_url,
    },
  }
}

// ─── Main flow ──────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log("scrape-myneta: Telangana 2023 MLAs")
  console.log(`  Index: ${INDEX_URL}`)
  console.log(`  Rate limit: ${REQUEST_DELAY_MS}ms between requests`)
  console.log(`  Outputs: ${RAW_OUT}, ${SQL_OUT}\n`)

  const indexHtml = await fetchPage(INDEX_URL)
  const winners = parseIndex(indexHtml)
  console.log(`Found ${winners.length} winners on index page.\n`)

  if (!winners.length) {
    console.error("No winners parsed — site layout may have changed.")
    process.exit(2)
  }

  const scraped: ScrapedMLA[] = []
  const sql: SqlPolitician[] = []

  for (let i = 0; i < winners.length; i++) {
    const w = winners[i]
    process.stdout.write(`[${i + 1}/${winners.length}] ${w.name} (${w.constituency})... `)
    try {
      await sleep(REQUEST_DELAY_MS)
      const html = await fetchPage(w.candidateUrl)
      const parsed = parseCandidate(html, w.candidateUrl)
      const full: ScrapedMLA = {
        name: w.name,
        party: w.party,
        constituency: w.constituency,
        myneta_url: w.candidateUrl,
        age: parsed.age ?? null,
        education: parsed.education ?? null,
        profession: parsed.profession ?? null,
        photo_url: parsed.photo_url ?? null,
        criminal_cases: parsed.criminal_cases ?? [],
        total_cases: parsed.total_cases ?? 0,
        serious_case_count: parsed.serious_case_count ?? 0,
        total_assets_inr: parsed.total_assets_inr ?? null,
        total_assets_raw: parsed.total_assets_raw ?? null,
        total_liabilities_inr: parsed.total_liabilities_inr ?? null,
        liabilities_raw: parsed.liabilities_raw ?? null,
        parse_errors: parsed.parse_errors ?? [],
      }
      scraped.push(full)
      sql.push(toSqlShape(full))
      console.log(
        `ok (${full.total_cases} cases, ${full.serious_case_count} serious)`
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`SKIP — ${msg}`)
    }

    // Checkpoint
    if ((i + 1) % CHECKPOINT_EVERY === 0) {
      fs.writeFileSync(RAW_OUT, JSON.stringify(scraped, null, 2))
      fs.writeFileSync(SQL_OUT, JSON.stringify(sql, null, 2))
      console.log(`  [checkpoint @ ${i + 1}]`)
    }
  }

  fs.writeFileSync(RAW_OUT, JSON.stringify(scraped, null, 2))
  fs.writeFileSync(SQL_OUT, JSON.stringify(sql, null, 2))

  const totalCases = scraped.reduce((a, p) => a + p.total_cases, 0)
  const withSerious = scraped.filter(p => p.serious_case_count > 0).length

  console.log(
    `\nScraped ${scraped.length} MLAs, ${totalCases} total cases, ${withSerious} politicians with serious cases (>5yr punishment)`
  )
  console.log(`Wrote ${RAW_OUT}`)
  console.log(`Wrote ${SQL_OUT}`)
}

// Only auto-run when invoked directly (so importing for tests / compile-check doesn't trigger network I/O)
if (require.main === module) {
  run().catch(err => {
    console.error("scrape-myneta failed:", err)
    process.exit(1)
  })
}
