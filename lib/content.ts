import fs from "fs"
import path from "path"
import matter from "gray-matter"
import {
  GovernmentPromiseSchema,
  IncidentFrontmatterSchema,
  PoliticianSchema,
  CrimeStatisticSchema,
} from "./schemas"
import type {
  GovernmentPromise,
  IncidentFrontmatter,
  Politician,
  CrimeStatistic,
} from "./schemas"
import { STATUS_SCORE_WEIGHT } from "./constants"

export type PromiseScore = {
  overall: number
  fulfilled: number
  onTrack: number
  concerning: number
  total: number
  byStatus: Record<string, number>
  byMinistry: Record<string, { score: number; count: number }>
  byElectionCycle: Record<string, { score: number; count: number }>
}

export function computeScore(promises: GovernmentPromise[]): PromiseScore {
  if (promises.length === 0) {
    return { overall: 0, fulfilled: 0, onTrack: 0, concerning: 0, total: 0, byStatus: {}, byMinistry: {}, byElectionCycle: {} }
  }

  const byStatus: Record<string, number> = {}
  const byMinistry: Record<string, { score: number; count: number }> = {}
  const byElectionCycle: Record<string, { score: number; count: number }> = {}

  let weightSum = 0
  for (const p of promises) {
    const w = STATUS_SCORE_WEIGHT[p.current_status] ?? 50
    weightSum += w
    byStatus[p.current_status] = (byStatus[p.current_status] ?? 0) + 1

    const ministry = p.ministry ?? "Unknown"
    if (!byMinistry[ministry]) byMinistry[ministry] = { score: 0, count: 0 }
    byMinistry[ministry].score += w
    byMinistry[ministry].count += 1

    const cycle = p.election_cycle ?? "Unknown"
    if (!byElectionCycle[cycle]) byElectionCycle[cycle] = { score: 0, count: 0 }
    byElectionCycle[cycle].score += w
    byElectionCycle[cycle].count += 1
  }

  for (const k of Object.keys(byMinistry)) {
    byMinistry[k].score = Math.round(byMinistry[k].score / byMinistry[k].count)
  }
  for (const k of Object.keys(byElectionCycle)) {
    byElectionCycle[k].score = Math.round(byElectionCycle[k].score / byElectionCycle[k].count)
  }

  return {
    overall: Math.round(weightSum / promises.length),
    fulfilled: promises.filter(p => p.current_status === "Fulfilled").length,
    onTrack: promises.filter(p => ["Fulfilled", "Partially Fulfilled", "In Progress"].includes(p.current_status)).length,
    concerning: promises.filter(p => ["Delayed", "Abandoned", "Contradicted"].includes(p.current_status)).length,
    total: promises.length,
    byStatus,
    byMinistry,
    byElectionCycle,
  }
}

// ─── File-based loaders (static mode, no DB) ────────────────────────────────

function loadPromisesFromFiles(): GovernmentPromise[] {
  const dir = path.join(process.cwd(), "content/promises")
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(file => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"))
      return GovernmentPromiseSchema.parse(raw)
    })
    .sort((a, b) => a.category.localeCompare(b.category))
}

function loadIncidentsFromFiles(): (IncidentFrontmatter & { body: string })[] {
  const dir = path.join(process.cwd(), "content/incidents")
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .map(file => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf-8"))
      const frontmatter = IncidentFrontmatterSchema.parse(data)
      return { ...frontmatter, body: content }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

// ─── DB-based loaders (server-rendered mode with Prisma) ─────────────────────

// Postgres returns null for optional columns; Zod optional() expects undefined.
function nullToUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as Record<string, unknown>
  for (const k of Object.keys(obj)) {
    out[k] = obj[k] === null ? undefined : obj[k]
  }
  return out as T
}

async function loadPromisesFromDb(): Promise<GovernmentPromise[]> {
  const { db } = await import("./db")
  const rows = await db.promise.findMany({
    include: {
      sources: true,
      updates: { include: { sources: true } },
      fact_checks: true,
    },
    orderBy: { category: "asc" },
  })

  return rows.map(row => GovernmentPromiseSchema.parse(nullToUndefined({
    ...row,
    sources: row.sources.map(s => nullToUndefined(s)),
    updates: row.updates.map(u => ({
      date: u.date,
      note: u.note,
      sources: u.sources.map(s => nullToUndefined(s)),
    })),
    fact_checks: row.fact_checks,
  })))
}

async function loadIncidentsFromDb(): Promise<(IncidentFrontmatter & { body: string })[]> {
  const { db } = await import("./db")
  const rows = await db.incident.findMany({
    include: { sources: true },
    orderBy: { date: "desc" },
  })

  return rows.map(row => ({
    ...IncidentFrontmatterSchema.parse(nullToUndefined({
      ...row,
      sources: row.sources.map(s => nullToUndefined(s)),
    })),
    body: row.body,
  }))
}

// ─── Public API — auto-selects DB or file based on DATABASE_URL ──────────────

const USE_DB = Boolean(process.env.DATABASE_URL && process.env.USE_DB !== "false")

export async function loadPromises(): Promise<GovernmentPromise[]> {
  if (USE_DB) return loadPromisesFromDb()
  return loadPromisesFromFiles()
}

export async function getPromiseBySlug(slug: string): Promise<GovernmentPromise | null> {
  const promises = await loadPromises()
  return promises.find(p => p.slug === slug) ?? null
}

export async function loadIncidents(): Promise<(IncidentFrontmatter & { body: string })[]> {
  if (USE_DB) return loadIncidentsFromDb()
  return loadIncidentsFromFiles()
}

export async function getIncidentBySlug(
  slug: string
): Promise<(IncidentFrontmatter & { body: string }) | null> {
  const incidents = await loadIncidents()
  return incidents.find(i => i.slug === slug) ?? null
}

// ─── Politicians & crime statistics (DB-only) ───────────────────────────────

async function loadPoliticiansFromDb(): Promise<Politician[]> {
  const { db } = await import("./db")
  type PoliticianRow = {
    id: string
    slug: string
    name: string
    party: string
    constituency: string | null
    position: string
    ministry: string | null
    district: string | null
    age: number | null
    education: string | null
    profession: string | null
    photo_url: string | null
    myneta_url: string | null
    wikipedia_url: string | null
    bio: string | null
    election_cycle: string | null
    criminal_cases: Array<{
      id: string
      case_type: string
      ipc_sections: string[]
      court: string | null
      case_number: string | null
      status: string
      date_filed: string | null
      summary: string
      source_url: string | null
      is_serious: boolean
    }>
    asset_declarations: Array<{
      id: string
      year: string
      election_type: string | null
      total_assets_inr: number | null
      liabilities_inr: number | null
      movable_inr: number | null
      immovable_inr: number | null
      source_url: string | null
    }>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: PoliticianRow[] = await (db as any).politician.findMany({
    include: {
      criminal_cases: true,
      asset_declarations: { orderBy: { year: "asc" } },
    },
    orderBy: { name: "asc" },
  })

  return rows.map(row =>
    PoliticianSchema.parse(
      nullToUndefined({
        ...row,
        criminal_cases: row.criminal_cases.map(c => nullToUndefined(c)),
        asset_declarations: row.asset_declarations.map(a => nullToUndefined(a)),
      })
    )
  )
}

export async function loadPoliticians(): Promise<Politician[]> {
  if (!USE_DB) return []
  return loadPoliticiansFromDb()
}

export async function getPoliticianBySlug(slug: string): Promise<Politician | null> {
  const politicians = await loadPoliticians()
  return politicians.find(p => p.slug === slug) ?? null
}

export async function loadCrimeStats(filter?: {
  year?: string
  district?: string
  category?: string
}): Promise<CrimeStatistic[]> {
  if (!USE_DB) return []
  const { db } = await import("./db")
  const where: Record<string, string> = {}
  if (filter?.year) where.year = filter.year
  if (filter?.district) where.district = filter.district
  if (filter?.category) where.category = filter.category
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (db as any).crimeStatistic.findMany({
    where,
    orderBy: [{ year: "desc" }, { district: "asc" }],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((r: any) => CrimeStatisticSchema.parse(nullToUndefined(r)))
}

// ─── Compute helpers ────────────────────────────────────────────────────────

export function countSeriousCases(politician: Politician): number {
  return politician.criminal_cases.filter(c => c.is_serious).length
}

export function totalCases(politician: Politician): number {
  return politician.criminal_cases.length
}

export function latestAssets(politician: Politician): number {
  if (politician.asset_declarations.length === 0) return 0
  const sorted = [...politician.asset_declarations].sort((a, b) =>
    b.year.localeCompare(a.year)
  )
  return sorted[0]?.total_assets_inr ?? 0
}

export function mlaWithMostCases(politicians: Politician[]): Politician | null {
  if (politicians.length === 0) return null
  return [...politicians].sort(
    (a, b) => totalCases(b) - totalCases(a)
  )[0]
}

export function crimeRateByDistrict(
  stats: CrimeStatistic[],
  district: string
): { total: number; byCategory: Record<string, number>; byYear: Record<string, number> } {
  const filtered = stats.filter(s => s.district === district)
  const byCategory: Record<string, number> = {}
  const byYear: Record<string, number> = {}
  let total = 0
  for (const s of filtered) {
    total += s.count
    byCategory[s.category] = (byCategory[s.category] ?? 0) + s.count
    byYear[s.year] = (byYear[s.year] ?? 0) + s.count
  }
  return { total, byCategory, byYear }
}
