import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { GovernmentPromiseSchema, IncidentFrontmatterSchema } from "../lib/schemas"

type SearchDoc = {
  id: string
  type: "promise" | "incident"
  title: string
  body: string
  href: string
  category: string
}

function buildIndex() {
  const docs: SearchDoc[] = []

  const promisesDir = path.join(process.cwd(), "content/promises")
  if (fs.existsSync(promisesDir)) {
    for (const file of fs.readdirSync(promisesDir).filter(f => f.endsWith(".json"))) {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(promisesDir, file), "utf-8"))
        const p = GovernmentPromiseSchema.parse(raw)
        docs.push({
          id: `promise-${p.slug}`,
          type: "promise",
          title: p.title,
          body: p.summary,
          href: `/promises/${p.slug}`,
          category: p.category,
        })
      } catch (e) {
        console.error(`Search index: skipping ${file} —`, e)
      }
    }
  }

  const incidentsDir = path.join(process.cwd(), "content/incidents")
  if (fs.existsSync(incidentsDir)) {
    for (const file of fs.readdirSync(incidentsDir).filter(f => f.endsWith(".md"))) {
      try {
        const { data, content } = matter(
          fs.readFileSync(path.join(incidentsDir, file), "utf-8")
        )
        const front = IncidentFrontmatterSchema.parse(data)
        docs.push({
          id: `incident-${front.slug}`,
          type: "incident",
          title: front.title,
          body: content.replace(/^---[\s\S]+?---\n?/, "").trim().slice(0, 400),
          href: `/incidents/${front.slug}`,
          category: front.category,
        })
      } catch (e) {
        console.error(`Search index: skipping ${file} —`, e)
      }
    }
  }

  const outDir = path.join(process.cwd(), "public")
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, "search-index.json")
  fs.writeFileSync(outPath, JSON.stringify(docs))
  console.log(`✅ Built search index: ${docs.length} documents → ${outPath}`)
}

buildIndex()
