import { z } from "zod"
import { db } from "@/lib/db"
import { verifyAdminKey, unauthorizedResponse } from "@/lib/auth"

export async function GET(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") ?? "pending_review"
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200)
  const offset = Number(searchParams.get("offset") ?? 0)

  const [items, total] = await Promise.all([
    db.discovery.findMany({
      where: { status },
      orderBy: { created_at: "desc" },
      take: limit,
      skip: offset,
    }),
    db.discovery.count({ where: { status } }),
  ])

  return Response.json({ total, limit, offset, items })
}

const PatchSchema = z.object({
  status: z.enum(["pending_review", "approved", "rejected"]),
  reviewed_by: z.string().optional(),
  rejection_reason: z.string().optional(),
  suggested_category: z.string().optional(),
  suggested_evidence_grade: z.string().optional(),
  suggested_type: z.enum(["promise", "incident", "unknown"]).optional(),
})

export async function PATCH(request: Request) {
  if (!verifyAdminKey(request)) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return Response.json({ error: "id required" }, { status: 400 })

  const body = await request.json().catch(() => null)
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 422 })
  }

  const discovery = await db.discovery.update({
    where: { id },
    data: {
      ...parsed.data,
      reviewed_at: new Date(),
    },
  })

  return Response.json({ status: "updated", id: discovery.id })
}
