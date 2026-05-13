import { describe, it, expect } from "vitest"
import { loadPromises, getPromiseBySlug, loadIncidents, getIncidentBySlug } from "@/lib/content"

describe("loadPromises", () => {
  it("returns array with at least one promise", async () => {
    const promises = await loadPromises()
    expect(promises.length).toBeGreaterThan(0)
  })

  it("each promise has slug and at least one source", async () => {
    const promises = await loadPromises()
    for (const p of promises) {
      expect(p.slug).toBeTruthy()
      expect(p.sources.length).toBeGreaterThan(0)
    }
  })

  it("returns null for unknown slug", async () => {
    const result = await getPromiseBySlug("does-not-exist-xyz")
    expect(result).toBeNull()
  })

  it("finds mahalakshmi-bus-pass", async () => {
    const p = await getPromiseBySlug("mahalakshmi-bus-pass")
    expect(p).not.toBeNull()
    expect(p?.current_status).toBe("Fulfilled")
  })
})

describe("loadIncidents", () => {
  it("returns array with at least one incident", async () => {
    const incidents = await loadIncidents()
    expect(incidents.length).toBeGreaterThan(0)
  })

  it("each incident has body content", async () => {
    const incidents = await loadIncidents()
    for (const i of incidents) {
      expect(i.slug).toBeTruthy()
      expect(i.body.length).toBeGreaterThan(0)
    }
  })

  it("returns null for unknown incident slug", async () => {
    const result = await getIncidentBySlug("does-not-exist-xyz")
    expect(result).toBeNull()
  })
})
