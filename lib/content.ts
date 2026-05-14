import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { GovernmentPromiseSchema, IncidentFrontmatterSchema } from "./schemas"
import type { GovernmentPromise, IncidentFrontmatter } from "./schemas"
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
