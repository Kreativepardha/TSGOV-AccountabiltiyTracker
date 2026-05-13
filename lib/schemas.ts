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
})

export type GovernmentPromise = z.infer<typeof GovernmentPromiseSchema>
export type IncidentFrontmatter = z.infer<typeof IncidentFrontmatterSchema>
export type Source = z.infer<typeof SourceSchema>
export type EvidenceGrade = z.infer<typeof EvidenceGradeSchema>
export type PromiseStatus = z.infer<typeof PromiseStatusSchema>
export type SourceType = z.infer<typeof SourceTypeSchema>
export type ElectionCycle = z.infer<typeof ElectionCycleSchema>
export type FactCheck = z.infer<typeof FactCheckSchema>
