/**
 * import-myneta.ts — Reads scripts/myneta-telangana-2023.json (produced by
 * scrape-myneta.ts) and idempotently upserts into the Prisma database.
 *
 * Tables touched:
 *   - Politician          (upsert by slug)
 *   - CriminalCase        (deleted-then-recreated per politician — cases are
 *                          re-scraped wholesale per refresh, so we treat the
 *                          scraper output as the authoritative snapshot)
 *   - AssetDeclaration    (upsert by {politician_id, year})
 *
 * USAGE
 *   DATABASE_URL=postgresql://... \
 *     TS_NODE_PROJECT=tsconfig.scripts.json \
 *     node -r ts-node/register scripts/import-myneta.ts
 *
 * Source attribution: every CriminalCase row and AssetDeclaration row keeps
 * a `source_url` pointing back to myneta.info per ADR's CC-BY terms.
 */

import * as fs from "fs"
import * as path from "path"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set")
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
// `Politician`, `CriminalCase`, and `AssetDeclaration` are part of a Prisma
// schema being built in parallel — until that lands, we type the client as
// `any` so this file still compiles against the current schema.prisma.
const db = new PrismaClient({ adapter } as never) as unknown as any

interface SqlCase {
  case_type: string
  ipc_sections: string[]
  status: string
  summary: string
  is_serious: boolean
  source_url: string
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
  criminal_cases: SqlCase[]
  asset_declaration: {
    year: "2023"
    total_assets_inr: number | null
    liabilities_inr: number | null
    source_url: string
  }
}

async function main(): Promise<void> {
  const inputPath = path.join(process.cwd(), "scripts", "myneta-telangana-2023.json")
  if (!fs.existsSync(inputPath)) {
    console.error(`Input not found: ${inputPath}`)
    console.error("Run scripts/scrape-myneta.ts first.")
    process.exit(1)
  }

  const rows = JSON.parse(fs.readFileSync(inputPath, "utf-8")) as SqlPolitician[]
  console.log(`import-myneta: loading ${rows.length} politicians`)

  let politiciansUpserted = 0
  let casesCreated = 0
  let assetDeclarationsUpserted = 0

  for (const r of rows) {
    try {
      const politician = await db.politician.upsert({
        where: { slug: r.slug },
        update: {
          name: r.name,
          party: r.party,
          constituency: r.constituency,
          position: r.position,
          election_cycle: r.election_cycle,
          district: r.district,
          age: r.age,
          education: r.education,
          profession: r.profession,
          photo_url: r.photo_url,
          myneta_url: r.myneta_url,
        },
        create: {
          slug: r.slug,
          name: r.name,
          party: r.party,
          constituency: r.constituency,
          position: r.position,
          election_cycle: r.election_cycle,
          district: r.district,
          age: r.age,
          education: r.education,
          profession: r.profession,
          photo_url: r.photo_url,
          myneta_url: r.myneta_url,
        },
      })
      politiciansUpserted++

      // Refresh criminal cases — drop & recreate so re-scrapes don't duplicate.
      await db.criminalCase.deleteMany({
        where: { politician_id: politician.id },
      })
      if (r.criminal_cases.length) {
        await db.criminalCase.createMany({
          data: r.criminal_cases.map(c => ({
            politician_id: politician.id,
            case_type: c.case_type,
            ipc_sections: c.ipc_sections,
            status: c.status,
            summary: c.summary,
            is_serious: c.is_serious,
            source_url: c.source_url,
          })),
        })
        casesCreated += r.criminal_cases.length
      }

      // Upsert this year's asset declaration.
      const a = r.asset_declaration
      await db.assetDeclaration.upsert({
        where: {
          politician_id_year: {
            politician_id: politician.id,
            year: a.year,
          },
        },
        update: {
          total_assets_inr: a.total_assets_inr,
          liabilities_inr: a.liabilities_inr,
          source_url: a.source_url,
        },
        create: {
          politician_id: politician.id,
          year: a.year,
          total_assets_inr: a.total_assets_inr,
          liabilities_inr: a.liabilities_inr,
          source_url: a.source_url,
        },
      })
      assetDeclarationsUpserted++

      console.log(`  ok ${r.slug}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  FAIL ${r.slug} — ${msg}`)
    }
  }

  console.log(
    `\nDone. Politicians: ${politiciansUpserted}, CriminalCases: ${casesCreated}, AssetDeclarations: ${assetDeclarationsUpserted}`
  )
  await db.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
