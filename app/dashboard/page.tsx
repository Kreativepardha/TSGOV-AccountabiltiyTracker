import type { Metadata } from "next"
import Link from "next/link"
import { loadPromises, loadIncidents, computeScore } from "@/lib/content"
import { ScoreCard } from "@/components/ScoreCard"
import { StatusBadge } from "@/components/StatusBadge"
import { EvidenceBadge } from "@/components/EvidenceBadge"

export const metadata: Metadata = {
  title: "Dashboard — Government Delivery Score",
  description: "Full breakdown of Telangana government promise delivery score by ministry, status, and election cycle.",
}

export default async function DashboardPage() {
  const [promises, incidents] = await Promise.all([loadPromises(), loadIncidents()])
  const score = computeScore(promises)

  const byStatus = Object.entries(score.byStatus).sort((a, b) => b[1] - a[1])
  const byCategory = Object.entries(
    promises.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const byCycle = Object.entries(score.byElectionCycle)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
        <h1 className="text-2xl font-bold mt-2">Accountability Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive view of promise delivery across all ministries and categories.
        </p>
      </div>

      <ScoreCard score={score} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* By Status */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Promises by Status</h2>
          {byStatus.map(([status, count]) => (
            <div key={status} className="flex items-center justify-between">
              <StatusBadge status={status as never} />
              <span className="text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>

        {/* By Category */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Promises by Category</h2>
          {byCategory.map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{cat}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* By Election Cycle */}
      {byCycle.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Score by Election Cycle</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {byCycle.map(([cycle, data]) => (
              <div key={cycle} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium">{cycle}</p>
                <p className="text-2xl font-bold text-blue-600">{data.score}</p>
                <p className="text-xs text-muted-foreground">{data.count} promise{data.count !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Promises Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold">All Promises</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-4 font-medium">Promise</th>
                <th className="text-left py-2 px-4 font-medium">Ministry</th>
                <th className="text-left py-2 px-4 font-medium">Status</th>
                <th className="text-left py-2 px-4 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {promises.map(p => (
                <tr key={p.slug} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link href={`/promises/${p.slug}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                    {p.responsible_minister && (
                      <p className="text-xs text-muted-foreground mt-0.5">{p.responsible_minister}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{p.ministry ?? "—"}</td>
                  <td className="py-3 px-4"><StatusBadge status={p.current_status} /></td>
                  <td className="py-3 px-4"><EvidenceBadge grade={p.evidence_grade} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 text-sm text-blue-600">
        <Link href="/promises" className="hover:underline">All promises →</Link>
        <Link href="/incidents" className="hover:underline">Incidents ({incidents.length}) →</Link>
        <Link href="/calendar" className="hover:underline">Deadline calendar →</Link>
        <Link href="/compare" className="hover:underline">Election cycle comparison →</Link>
      </div>
    </main>
  )
}
