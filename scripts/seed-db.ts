/**
 * seed-db.ts — imports existing JSON/MD content files into PostgreSQL via Prisma.
 * Run once after DB is provisioned:
 *   DATABASE_URL=postgresql://... TS_NODE_PROJECT=tsconfig.scripts.json node -r ts-node/register scripts/seed-db.ts
 */
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { GovernmentPromiseSchema, IncidentFrontmatterSchema } from "../lib/schemas"

if (!process.env.DATABASE_URL) {
  console.error("❌  DATABASE_URL not set")
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const db = new PrismaClient({ adapter } as never)

async function seedPromises() {
  const dir = path.join(process.cwd(), "content/promises")
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"))
  console.log(`\nSeeding ${files.length} promises...`)

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"))
    const p = GovernmentPromiseSchema.parse(raw)

    await db.promise.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        manifesto_section: p.manifesto_section,
        announced_date: p.announced_date,
        deadline: p.deadline,
        deadline_date: p.deadline_date,
        target_beneficiaries: p.target_beneficiaries,
        target_amount: p.target_amount,
        ministry: p.ministry,
        responsible_minister: p.responsible_minister,
        election_cycle: p.election_cycle,
        districts: p.districts,
        budget_allocated: p.budget_allocated,
        budget_spent: p.budget_spent,
        current_status: p.current_status,
        evidence_grade: p.evidence_grade,
        summary: p.summary,
        tags: p.tags,
        last_reviewed: p.last_reviewed,
        reviewer_notes: p.reviewer_notes,
        sources: {
          create: p.sources.map(s => ({
            label: s.label,
            url: s.url,
            date: s.date,
            outlet: s.outlet,
            source_type: s.source_type,
            archived_url: s.archived_url,
            handle: s.handle,
          })),
        },
        updates: {
          create: p.updates.map(u => ({
            date: u.date,
            note: u.note,
            sources: {
              create: u.sources.map(s => ({
                label: s.label,
                url: s.url,
                date: s.date,
                outlet: s.outlet,
                source_type: s.source_type,
              })),
            },
          })),
        },
        fact_checks: {
          create: p.fact_checks.map(fc => ({
            outlet: fc.outlet,
            url: fc.url,
            verdict: fc.verdict,
            date: fc.date,
          })),
        },
      },
    })
    console.log(`  ✅ ${p.slug}`)
  }
}

async function seedIncidents() {
  const dir = path.join(process.cwd(), "content/incidents")
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".md"))
  console.log(`\nSeeding ${files.length} incidents...`)

  for (const file of files) {
    const { data, content } = matter(
      fs.readFileSync(path.join(dir, file), "utf-8")
    )
    const i = IncidentFrontmatterSchema.parse(data)

    await db.incident.upsert({
      where: { slug: i.slug },
      update: {},
      create: {
        slug: i.slug,
        title: i.title,
        date: i.date,
        category: i.category,
        district: i.district,
        people_involved: i.people_involved,
        evidence_grade: i.evidence_grade,
        body: content,
        tags: i.tags,
        related_promises: i.related_promises,
        last_reviewed: i.last_reviewed,
        sources: {
          create: i.sources.map(s => ({
            label: s.label,
            url: s.url,
            date: s.date,
            outlet: s.outlet,
            source_type: s.source_type,
            archived_url: s.archived_url,
            handle: s.handle,
          })),
        },
      },
    })
    console.log(`  ✅ ${i.slug}`)
  }
}

async function main() {
  console.log("🌱 TSGOV DB Seed Script")
  await seedPromises()
  await seedIncidents()
  console.log("\n✅ Seed complete")
  await db.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
