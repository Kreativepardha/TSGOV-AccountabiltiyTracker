import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(_req: NextRequest) {
  try {
    await db.siteCounter.upsert({
      where: { key: "total_visits" },
      create: { key: "total_visits", count: 1 },
      update: { count: { increment: 1 } },
    })
    return NextResponse.json({ ok: true })
  } catch {
    // DB unavailable (local dev without DATABASE_URL) — silently ignore
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
