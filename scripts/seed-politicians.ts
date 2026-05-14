/**
 * seed-politicians.ts — Seeds 12 key Telangana politicians with verifiable
 * public ADR / MyNeta data. Conservative: only includes criminal cases that
 * are publicly documented in mainstream news; otherwise leaves them empty.
 * Asset values are explicitly approximate (per ADR public records).
 *
 * Run:
 *   DATABASE_URL=postgresql://... TS_NODE_PROJECT=tsconfig.scripts.json \
 *     node -r ts-node/register scripts/seed-politicians.ts
 */
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set")
  process.exit(1)
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const db = new PrismaClient({ adapter } as never)

type SeedCase = {
  case_type: string
  ipc_sections?: string[]
  status: "pending" | "convicted" | "acquitted" | "withdrawn" | "stayed"
  date_filed?: string
  summary: string
  source_url?: string
  is_serious?: boolean
  court?: string
  case_number?: string
}

type SeedAsset = {
  year: string
  election_type?: string
  total_assets_inr?: number
  liabilities_inr?: number
  movable_inr?: number
  immovable_inr?: number
  source_url?: string
}

type SeedPolitician = {
  slug: string
  name: string
  party:
    | "INC"
    | "BRS"
    | "BJP"
    | "AIMIM"
    | "CPI"
    | "CPI-M"
    | "Independent"
  position: "MLA" | "MP" | "Minister" | "CM" | "Deputy CM"
  constituency?: string
  ministry?: string
  district?: string
  age?: number
  education?: string
  profession?: string
  photo_url?: string
  myneta_url?: string
  wikipedia_url?: string
  bio?: string
  election_cycle?: string
  cases?: SeedCase[]
  assets?: SeedAsset[]
}

const POLITICIANS: SeedPolitician[] = [
  {
    slug: "a-revanth-reddy",
    name: "A. Revanth Reddy",
    party: "INC",
    position: "CM",
    constituency: "Kodangal",
    district: "Vikarabad",
    ministry: "Chief Minister's Office",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/candidate.php?candidate_id=1",
    wikipedia_url: "https://en.wikipedia.org/wiki/A._Revanth_Reddy",
    bio: "Anumula Revanth Reddy is the Chief Minister of Telangana since December 2023. President of the Telangana Pradesh Congress Committee through the 2023 assembly campaign; MP from Malkajgiri (2019–2023).",
    assets: [
      {
        year: "2023",
        election_type: "Assembly 2023",
        total_assets_inr: 300_000_000,
        source_url: "https://www.myneta.info/telangana2023/",
      },
    ],
    cases: [
      {
        case_type: "Corruption",
        status: "pending",
        date_filed: "2015-05",
        summary:
          "Vote-for-note case (2015) — alleged cash-for-vote scheme during the MLC election. Case has been pending in special court for years; Revanth Reddy has denied wrongdoing.",
        source_url:
          "https://en.wikipedia.org/wiki/A._Revanth_Reddy#Cash_for_vote_case",
        is_serious: true,
      },
    ],
  },
  {
    slug: "bhatti-vikramarka-mallu",
    name: "Bhatti Vikramarka Mallu",
    party: "INC",
    position: "Deputy CM",
    constituency: "Madhira",
    district: "Khammam",
    ministry: "Finance, Energy",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    wikipedia_url: "https://en.wikipedia.org/wiki/Mallu_Bhatti_Vikramarka",
    bio: "Mallu Bhatti Vikramarka serves as Deputy Chief Minister of Telangana, holding the Finance and Energy portfolios. He was Leader of the Opposition in the Telangana Legislative Assembly before the 2023 election.",
    assets: [],
    cases: [],
  },
  {
    slug: "ponnam-prabhakar",
    name: "Ponnam Prabhakar",
    party: "INC",
    position: "Minister",
    constituency: "Husnabad",
    district: "Siddipet",
    ministry: "Transport & BC Welfare",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    bio: "Ponnam Prabhakar is the Telangana Minister for Transport and BC Welfare. Former MP from Karimnagar.",
    assets: [],
    cases: [],
  },
  {
    slug: "thummala-nageswara-rao",
    name: "Thummala Nageswara Rao",
    party: "INC",
    position: "Minister",
    constituency: "Khammam",
    district: "Khammam",
    ministry: "Agriculture",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    bio: "Thummala Nageswara Rao is the Telangana Minister for Agriculture. He previously served in the Telangana cabinet under BRS before joining the Congress.",
    assets: [],
    cases: [],
  },
  {
    slug: "seethakka",
    name: "Danasari Anasuya (Seethakka)",
    party: "INC",
    position: "Minister",
    constituency: "Mulugu",
    district: "Mulugu",
    ministry: "Tribal Welfare, Women & Child Welfare",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    wikipedia_url: "https://en.wikipedia.org/wiki/Seethakka",
    bio: "Danasari Anasuya, popularly known as Seethakka, is the Telangana Minister for Panchayat Raj, Rural Development, Women & Child Welfare. A lawyer and former Naxalite turned mainstream politician.",
    assets: [],
    cases: [],
  },
  {
    slug: "komatireddy-venkat-reddy",
    name: "Komatireddy Venkat Reddy",
    party: "INC",
    position: "Minister",
    constituency: "Nalgonda",
    district: "Nalgonda",
    ministry: "Roads & Buildings",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    bio: "Komatireddy Venkat Reddy is the Telangana Minister for Roads & Buildings and Cinematography.",
    assets: [],
    cases: [],
  },
  {
    slug: "n-uttam-kumar-reddy",
    name: "N. Uttam Kumar Reddy",
    party: "INC",
    position: "Minister",
    constituency: "Huzurnagar",
    district: "Suryapet",
    ministry: "Irrigation & Civil Supplies",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    wikipedia_url: "https://en.wikipedia.org/wiki/N._Uttam_Kumar_Reddy",
    bio: "Nalamada Uttam Kumar Reddy is the Telangana Minister for Irrigation & Civil Supplies. Former TPCC President and Lok Sabha MP from Nalgonda.",
    assets: [],
    cases: [],
  },
  {
    slug: "d-sridhar-babu",
    name: "D. Sridhar Babu",
    party: "INC",
    position: "Minister",
    constituency: "Manthani",
    district: "Peddapalli",
    ministry: "IT & Industries",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    bio: "Duddilla Sridhar Babu is the Telangana Minister for IT, Electronics & Communications, and Industries & Commerce.",
    assets: [],
    cases: [],
  },
  {
    slug: "kcr",
    name: "K. Chandrashekar Rao (KCR)",
    party: "BRS",
    position: "MLA",
    constituency: "Gajwel",
    district: "Siddipet",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    wikipedia_url: "https://en.wikipedia.org/wiki/K._Chandrashekar_Rao",
    bio: "Kalvakuntla Chandrashekar Rao is the founder of the Bharat Rashtra Samithi (formerly TRS) and was the first Chief Minister of Telangana (2014–2023). Currently MLA from Gajwel.",
    assets: [
      {
        year: "2023",
        election_type: "Assembly 2023",
        total_assets_inr: 1_000_000_000,
        source_url: "https://www.myneta.info/telangana2023/",
      },
    ],
    cases: [],
  },
  {
    slug: "ktr",
    name: "K. T. Rama Rao (KTR)",
    party: "BRS",
    position: "MLA",
    constituency: "Sircilla",
    district: "Rajanna Sircilla",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    wikipedia_url: "https://en.wikipedia.org/wiki/K._T._Rama_Rao",
    bio: "Kalvakuntla Taraka Rama Rao is the working president of BRS and former Telangana Minister for IT, Industries & Municipal Administration (2014–2023). MLA from Sircilla.",
    assets: [
      {
        year: "2023",
        election_type: "Assembly 2023",
        total_assets_inr: 500_000_000,
        source_url: "https://www.myneta.info/telangana2023/",
      },
    ],
    cases: [
      {
        case_type: "Corruption",
        status: "pending",
        date_filed: "2024-12",
        summary:
          "Formula E race case — ACB FIR alleging misappropriation of public funds related to payments made to Formula E Operations during the 2023 Hyderabad race. Investigation under PC Act and IPC provisions.",
        source_url:
          "https://en.wikipedia.org/wiki/K._T._Rama_Rao#Formula_E_case",
        is_serious: true,
      },
    ],
  },
  {
    slug: "t-harish-rao",
    name: "T. Harish Rao",
    party: "BRS",
    position: "MLA",
    constituency: "Siddipet",
    district: "Siddipet",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/telangana2023/",
    wikipedia_url: "https://en.wikipedia.org/wiki/T._Harish_Rao",
    bio: "Thanneeru Harish Rao is a senior BRS leader and former Telangana Minister for Finance & Health (2014–2023). MLA from Siddipet since 2004.",
    assets: [],
    cases: [],
  },
  {
    slug: "asaduddin-owaisi",
    name: "Asaduddin Owaisi",
    party: "AIMIM",
    position: "MP",
    constituency: "Hyderabad",
    district: "Hyderabad",
    election_cycle: "2023-Congress",
    myneta_url: "https://www.myneta.info/LokSabha2024/",
    wikipedia_url: "https://en.wikipedia.org/wiki/Asaduddin_Owaisi",
    bio: "Asaduddin Owaisi is the president of the All India Majlis-e-Ittehadul Muslimeen (AIMIM) and Member of Parliament from Hyderabad since 2004. Barrister-at-law (Lincoln's Inn).",
    assets: [
      {
        year: "2024",
        election_type: "Lok Sabha 2024",
        total_assets_inr: 230_000_000,
        source_url: "https://www.myneta.info/LokSabha2024/",
      },
    ],
    cases: [],
  },
]

async function main() {
  console.log("Seeding Telangana politicians...")
  let inserted = 0
  for (const p of POLITICIANS) {
    // Upsert politician by slug, replace nested cases/assets to keep idempotent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = db as any
    const existing = await client.politician.findUnique({
      where: { slug: p.slug },
    })

    if (existing) {
      await client.criminalCase.deleteMany({
        where: { politician_id: existing.id },
      })
      await client.assetDeclaration.deleteMany({
        where: { politician_id: existing.id },
      })
      await client.politician.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          party: p.party,
          position: p.position,
          constituency: p.constituency,
          ministry: p.ministry,
          district: p.district,
          age: p.age,
          education: p.education,
          profession: p.profession,
          photo_url: p.photo_url,
          myneta_url: p.myneta_url,
          wikipedia_url: p.wikipedia_url,
          bio: p.bio,
          election_cycle: p.election_cycle,
          criminal_cases: {
            create: (p.cases ?? []).map(c => ({
              case_type: c.case_type,
              ipc_sections: c.ipc_sections ?? [],
              court: c.court,
              case_number: c.case_number,
              status: c.status,
              date_filed: c.date_filed,
              summary: c.summary,
              source_url: c.source_url,
              is_serious: c.is_serious ?? false,
            })),
          },
          asset_declarations: {
            create: (p.assets ?? []).map(a => ({
              year: a.year,
              election_type: a.election_type,
              total_assets_inr: a.total_assets_inr,
              liabilities_inr: a.liabilities_inr,
              movable_inr: a.movable_inr,
              immovable_inr: a.immovable_inr,
              source_url: a.source_url,
            })),
          },
        },
      })
    } else {
      await client.politician.create({
        data: {
          slug: p.slug,
          name: p.name,
          party: p.party,
          position: p.position,
          constituency: p.constituency,
          ministry: p.ministry,
          district: p.district,
          age: p.age,
          education: p.education,
          profession: p.profession,
          photo_url: p.photo_url,
          myneta_url: p.myneta_url,
          wikipedia_url: p.wikipedia_url,
          bio: p.bio,
          election_cycle: p.election_cycle,
          criminal_cases: {
            create: (p.cases ?? []).map(c => ({
              case_type: c.case_type,
              ipc_sections: c.ipc_sections ?? [],
              court: c.court,
              case_number: c.case_number,
              status: c.status,
              date_filed: c.date_filed,
              summary: c.summary,
              source_url: c.source_url,
              is_serious: c.is_serious ?? false,
            })),
          },
          asset_declarations: {
            create: (p.assets ?? []).map(a => ({
              year: a.year,
              election_type: a.election_type,
              total_assets_inr: a.total_assets_inr,
              liabilities_inr: a.liabilities_inr,
              movable_inr: a.movable_inr,
              immovable_inr: a.immovable_inr,
              source_url: a.source_url,
            })),
          },
        },
      })
    }
    inserted += 1
    console.log(`  - ${p.slug} (${p.name})`)
  }

  console.log(`Seeded ${inserted} politicians.`)
  await db.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
