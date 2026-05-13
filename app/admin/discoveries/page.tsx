import { db } from "@/lib/db"
import { DiscoveryQueue } from "./DiscoveryQueue"

export const dynamic = "force-dynamic"

export default async function DiscoveriesPage() {
  const pending = await db.discovery.findMany({
    where: { status: "pending_review" },
    orderBy: { created_at: "desc" },
    take: 100,
  }).catch(() => [])

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Discovery Queue</h1>
        <span className="text-sm text-muted-foreground">{pending.length} pending</span>
      </div>
      {pending.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
          Queue empty — no pending discoveries.
          {" "}Run the discovery pipeline to populate.
        </div>
      ) : (
        <DiscoveryQueue items={pending} />
      )}
    </div>
  )
}
