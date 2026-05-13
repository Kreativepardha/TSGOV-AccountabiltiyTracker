import { describe, it, expect } from "vitest"
import { GovernmentPromiseSchema, IncidentFrontmatterSchema } from "@/lib/schemas"

const validSource = {
  label: "GO Ms 12/2023 Transport",
  url: "https://tsrtc.telangana.gov.in/go-ms-12",
  date: "2023-12-10",
  outlet: "Telangana Government",
  source_type: "government_record" as const,
}

const validPromise = {
  slug: "mahalakshmi-bus-pass",
  title: "Free bus travel for women (Mahalakshmi scheme)",
  category: "Welfare" as const,
  manifesto_section: "Six Guarantees — Guarantee 1",
  announced_date: "2023-11-15",
  current_status: "Fulfilled" as const,
  evidence_grade: "Official Record" as const,
  summary: "Free bus travel for all women in Telangana TSRTC buses implemented via GO.",
  sources: [validSource],
  last_reviewed: "2026-01-15",
}

describe("GovernmentPromiseSchema", () => {
  it("rejects a promise with no sources", () => {
    const result = GovernmentPromiseSchema.safeParse({ ...validPromise, sources: [] })
    expect(result.success).toBe(false)
  })

  it("accepts a valid promise", () => {
    const result = GovernmentPromiseSchema.safeParse(validPromise)
    expect(result.success).toBe(true)
  })

  it("rejects a source missing source_type", () => {
    const badSource = { label: "test", url: "https://example.com", date: "2024-01-01", outlet: "Test" }
    const result = GovernmentPromiseSchema.safeParse({ ...validPromise, sources: [badSource] })
    expect(result.success).toBe(false)
  })

  it("rejects invalid status enum", () => {
    const result = GovernmentPromiseSchema.safeParse({
      ...validPromise,
      current_status: "Maybe",
    })
    expect(result.success).toBe(false)
  })

  it("rejects summary over 500 chars", () => {
    const result = GovernmentPromiseSchema.safeParse({
      ...validPromise,
      summary: "x".repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe("IncidentFrontmatterSchema", () => {
  const validIncident = {
    slug: "test-incident",
    title: "Test incident",
    date: "2024-03-18",
    category: "Education" as const,
    district: "Hyderabad",
    evidence_grade: "Single Source" as const,
    sources: [validSource],
    last_reviewed: "2026-01-10",
  }

  it("accepts a valid incident", () => {
    const result = IncidentFrontmatterSchema.safeParse(validIncident)
    expect(result.success).toBe(true)
  })

  it("rejects incident with no sources", () => {
    const result = IncidentFrontmatterSchema.safeParse({ ...validIncident, sources: [] })
    expect(result.success).toBe(false)
  })

  it("rejects invalid category", () => {
    const result = IncidentFrontmatterSchema.safeParse({
      ...validIncident,
      category: "Not A Category",
    })
    expect(result.success).toBe(false)
  })
})
