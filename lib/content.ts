import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { GovernmentPromiseSchema, IncidentFrontmatterSchema } from "./schemas"
import type { GovernmentPromise, IncidentFrontmatter } from "./schemas"

export async function loadPromises(): Promise<GovernmentPromise[]> {
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

export async function getPromiseBySlug(slug: string): Promise<GovernmentPromise | null> {
  const promises = await loadPromises()
  return promises.find(p => p.slug === slug) ?? null
}

export async function loadIncidents(): Promise<(IncidentFrontmatter & { body: string })[]> {
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

export async function getIncidentBySlug(
  slug: string
): Promise<(IncidentFrontmatter & { body: string }) | null> {
  const incidents = await loadIncidents()
  return incidents.find(i => i.slug === slug) ?? null
}
