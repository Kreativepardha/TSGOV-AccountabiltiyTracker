import { z } from "zod"

export const PromiseStatusSchema = z.enum([
  "Fulfilled",
  "Partially Fulfilled",
  "In Progress",
  "Delayed",
  "Abandoned",
  "Contradicted",
  "Unverifiable",
])

export const EvidenceGradeSchema = z.enum([
  "Official Record",
  "Primary Evidence",
  "Multiple Sources",
  "Single Source",
  "Allegation",
])

export const SourceTypeSchema = z.enum([
  "government_record",
  "official_social",
  "news_article",
  "journalist_tweet",
  "reddit_thread",
  "twitter_post",
  "youtube_video",
  "press_release",
  "rti_response",
])

export const SourceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  date: z.string(),
  outlet: z.string(),
  source_type: SourceTypeSchema,
  archived_url: z.string().url().optional(),
  handle: z.string().optional(),
})

export const ElectionCycleSchema = z.enum([
  "2023-Congress",
  "2018-BRS",
  "2014-TRS",
])

export const FactCheckSchema = z.object({
  outlet: z.string(),
  url: z.string().url(),
  verdict: z.string(),
  date: z.string(),
})

export const GovernmentPromiseSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.enum([
    "Welfare",
    "Employment",
    "Agriculture",
    "Infrastructure",
    "Education",
    "Health",
    "Women & Child",
    "Housing",
    "Finance",
    "Governance",
  ]),
  manifesto_section: z.string(),
  announced_date: z.string(),
  deadline: z.string().optional(),
  deadline_date: z.string().optional(),
  target_beneficiaries: z.string().optional(),
  target_amount: z.string().optional(),
  ministry: z.string().optional(),
  responsible_minister: z.string().optional(),
  election_cycle: ElectionCycleSchema.optional(),
  districts: z.array(z.string()).default([]),
  budget_allocated: z.string().optional(),
  budget_spent: z.string().optional(),
  fact_checks: z.array(FactCheckSchema).default([]),
  current_status: PromiseStatusSchema,
  evidence_grade: EvidenceGradeSchema,
  summary: z.string().max(500),
  sources: z.array(SourceSchema).min(1),
  updates: z.array(z.object({
    date: z.string(),
    note: z.string(),
    sources: z.array(SourceSchema),
  })).default([]),
  tags: z.array(z.string()).default([]),
  last_reviewed: z.string(),
  reviewer_notes: z.string().optional(),
})

export const DemographicSchema = z.enum([
  "women",
  "SC/ST",
  "minor",
  "minority",
  "general",
])

export const IncidentFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  category: z.enum([
    "Welfare Delivery Failure",
    "Infrastructure Failure",
    "Flood / Disaster Management",
    "Law & Order",
    "Education",
    "Farmer Issues",
    "Financial / Fiscal",
    "Environment",
    "Health",
    "Communal / Social",
    "Scam / Corruption Allegation",
    "Minister Controversy",
  ]),
  district: z.string(),
  people_involved: z.array(z.string()).default([]),
  evidence_grade: EvidenceGradeSchema,
  sources: z.array(SourceSchema).min(1),
  tags: z.array(z.string()).default([]),
  related_promises: z.array(z.string()).default([]),
  last_reviewed: z.string(),
  affected_demographic: DemographicSchema.optional(),
})

// ─── Politician / crime tracking ────────────────────────────────────────────

export const PartySchema = z.enum([
  "INC",
  "BRS",
  "BJP",
  "AIMIM",
  "CPI",
  "CPI-M",
  "Independent",
])

export const PositionSchema = z.enum([
  "MLA",
  "MP",
  "Minister",
  "CM",
  "Deputy CM",
])

export const CaseTypeSchema = z.enum([
  "IPC",
  "POCSO",
  "Corruption",
  "Defamation",
  "Communal",
  "Economic Offence",
])

export const CaseStatusSchema = z.enum([
  "pending",
  "convicted",
  "acquitted",
  "withdrawn",
  "stayed",
])

export const CrimeCategorySchema = z.enum([
  "rape",
  "POCSO",
  "dowry_death",
  "domestic_violence",
  "molestation",
  "trafficking",
  "acid_attack",
  "stalking",
])

export const CriminalCaseSchema = z.object({
  id: z.string().optional(),
  case_type: CaseTypeSchema,
  ipc_sections: z.array(z.string()).default([]),
  court: z.string().optional(),
  case_number: z.string().optional(),
  status: CaseStatusSchema,
  date_filed: z.string().optional(),
  summary: z.string(),
  source_url: z.string().url().optional(),
  is_serious: z.boolean().default(false),
})

export const AssetDeclarationSchema = z.object({
  id: z.string().optional(),
  year: z.string(),
  election_type: z.string().optional(),
  total_assets_inr: z.number().optional(),
  liabilities_inr: z.number().optional(),
  movable_inr: z.number().optional(),
  immovable_inr: z.number().optional(),
  source_url: z.string().url().optional(),
})

export const PoliticianSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  name: z.string(),
  party: PartySchema,
  constituency: z.string().optional(),
  position: PositionSchema,
  ministry: z.string().optional(),
  district: z.string().optional(),
  age: z.number().int().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  photo_url: z.string().url().optional(),
  myneta_url: z.string().url().optional(),
  wikipedia_url: z.string().url().optional(),
  bio: z.string().optional(),
  election_cycle: z.string().optional(),
  criminal_cases: z.array(CriminalCaseSchema).default([]),
  asset_declarations: z.array(AssetDeclarationSchema).default([]),
})

export const CrimeStatisticSchema = z.object({
  id: z.string().optional(),
  year: z.string(),
  district: z.string(),
  category: CrimeCategorySchema,
  count: z.number().int().nonnegative(),
  source: z.string(),
  source_url: z.string().url().optional(),
  notes: z.string().optional(),
})

export type GovernmentPromise = z.infer<typeof GovernmentPromiseSchema>
export type IncidentFrontmatter = z.infer<typeof IncidentFrontmatterSchema>
export type Source = z.infer<typeof SourceSchema>
export type EvidenceGrade = z.infer<typeof EvidenceGradeSchema>
export type PromiseStatus = z.infer<typeof PromiseStatusSchema>
export type SourceType = z.infer<typeof SourceTypeSchema>
export type ElectionCycle = z.infer<typeof ElectionCycleSchema>
export type FactCheck = z.infer<typeof FactCheckSchema>
export type Demographic = z.infer<typeof DemographicSchema>
export type Party = z.infer<typeof PartySchema>
export type Position = z.infer<typeof PositionSchema>
export type CaseType = z.infer<typeof CaseTypeSchema>
export type CaseStatus = z.infer<typeof CaseStatusSchema>
export type CrimeCategory = z.infer<typeof CrimeCategorySchema>
export type CriminalCase = z.infer<typeof CriminalCaseSchema>
export type AssetDeclaration = z.infer<typeof AssetDeclarationSchema>
export type Politician = z.infer<typeof PoliticianSchema>
export type CrimeStatistic = z.infer<typeof CrimeStatisticSchema>
