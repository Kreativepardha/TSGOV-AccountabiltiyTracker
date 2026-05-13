import { z } from "zod"
import { db } from "@/lib/db"
import { verifyAdminKey, unauthorizedResponse } from "@/lib/auth"

const IngestSchema = z.object({
  title: z.string().min(1),
  body_text: z.string().optional(),
  url: z.string().url(),
  outlet: z.string().optional(),
  source_type: z.string().optional(),
  date: z.string().optional(),
  discovery_source: z.string(),
  suggested_category: z.string().optional(),
  suggested_evidence_grade: z.string().optional(),
  suggested_type: z.enum(["promise", "incident", "unknown"]).optional(),
  archived_url: z.string().url().optional(),
})

export async function POST(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse()

  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 })

  const parsed = IngestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 })
  }

  const existing = await db.discovery.findUnique({ where: { url: parsed.data.url } })
  if (existing) {
    return Response.json({ status: "duplicate", id: existing.id }, { status: 200 })
  }

  const discovery = await db.discovery.create({ data: parsed.data })
  return Response.json({ status: "created", id: discovery.id }, { status: 201 })
}
