import { db } from "@/lib/db"
import { Eye } from "lucide-react"

async function getVisitCount(): Promise<bigint | null> {
  try {
    const row = await db.siteCounter.findUnique({ where: { key: "total_visits" } })
    return row?.count ?? 0n
  } catch {
    return null
  }
}

export async function VisitorCountCard() {
  const count = await getVisitCount()

  return (
    <section className="flex items-center gap-4 rounded-lg border bg-gradient-to-br from-blue-50/80 to-white p-4">
      <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
        <Eye className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Total site visits</p>
        {count === null ? (
          <p className="text-2xl font-bold text-foreground">—</p>
        ) : (
          <p className="text-2xl font-bold text-foreground">
            {Number(count).toLocaleString("en-IN")}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">page views across all visitors</p>
      </div>
    </section>
  )
}
