import Link from "next/link"
import { db } from "@/lib/db"
import { loadPromises, loadIncidents } from "@/lib/content"

export default async function AdminOverviewPage() {
  const [pendingCount, approvedCount, rejectedCount, promises, incidents] = await Promise.all([
    db.discovery.count({ where: { status: "pending_review" } }).catch(() => null),
    db.discovery.count({ where: { status: "approved" } }).catch(() => null),
    db.discovery.count({ where: { status: "rejected" } }).catch(() => null),
    loadPromises().catch(() => []),
    loadIncidents().catch(() => []),
  ])

  const dbConnected = pendingCount !== null

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold">Admin Overview</h1>

      {!dbConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          <strong>Database not connected.</strong> Set DATABASE_URL environment variable to enable discovery pipeline.
          Content is currently served from static files.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Published Promises" value={promises.length} href="/promises" />
        <StatBox label="Published Incidents" value={incidents.length} href="/incidents" />
        <StatBox label="Pending Review" value={pendingCount ?? "—"} href="/admin/discoveries" highlight />
        <StatBox label="Approved / Rejected" value={dbConnected ? `${approvedCount} / ${rejectedCount}` : "—"} />
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/discoveries"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Open Discovery Queue →
        </Link>
      </div>

      <div className="border rounded-lg p-4 text-sm space-y-2">
        <h2 className="font-semibold">Quick setup checklist</h2>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>Set DATABASE_URL (Neon Postgres connection string)</li>
          <li>Set DATABASE_URL_UNPOOLED (direct connection for migrations)</li>
          <li>Set ADMIN_API_KEY (random secret for pipeline auth)</li>
          <li>Run: <code className="bg-gray-100 px-1 rounded">npx prisma db push</code> to create tables</li>
          <li>Run: <code className="bg-gray-100 px-1 rounded">DATABASE_URL=... npx ts-node scripts/seed-db.ts</code> to import existing content</li>
          <li>Set NEWSAPI_KEY and TWITTER_BEARER_TOKEN for discovery pipeline</li>
        </ul>
      </div>
    </div>
  )
}

function StatBox({ label, value, href, highlight }: { label: string; value: string | number; href?: string; highlight?: boolean }) {
  const content = (
    <div className={`border rounded-lg p-4 space-y-1 ${highlight ? "border-amber-300 bg-amber-50" : "bg-white"}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}
