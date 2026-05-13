import type { Metadata } from "next"
import Link from "next/link"
import { loadPromises, computeScore } from "@/lib/content"
import { StatusBadge } from "@/components/StatusBadge"
import { ELECTION_CYCLES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Compare Election Cycles — Telangana Governance",
  description: "Compare promise delivery performance across different Telangana election cycles.",
}

export default async function ComparePage() {
  const promises = await loadPromises()

  const cycleGroups = ELECTION_CYCLES.map(cycle => {
    const cyclePromises = promises.filter(p => p.election_cycle === cycle)
    const score = computeScore(cyclePromises)
    return { cycle, promises: cyclePromises, score }
  }).filter(g => g.promises.length > 0)

  const unknown = promises.filter(p => !p.election_cycle)

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">← Home</Link>
        <h1 className="text-2xl font-bold mt-2">Election Cycle Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare promise delivery performance across election cycles.
        </p>
      </div>

      {cycleGroups.length === 0 && (
        <p className="text-muted-foreground text-sm">No election cycle data yet. Add the <code>election_cycle</code> field to promise files.</p>
      )}

      {/* Summary comparison */}
      {cycleGroups.length > 1 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cycleGroups.map(({ cycle, score }) => {
            const color = score.overall >= 70 ? "border-emerald-300 bg-emerald-50" : score.overall >= 45 ? "border-amber-300 bg-amber-50" : "border-red-300 bg-red-50"
            const textColor = score.overall >= 70 ? "text-emerald-700" : score.overall >= 45 ? "text-amber-700" : "text-red-700"
            return (
              <div key={cycle} className={`rounded-lg border-2 p-4 space-y-2 ${color}`}>
                <p className="font-semibold text-sm">{cycle}</p>
                <p className={`text-4xl font-bold ${textColor}`}>{score.overall}</p>
                <p className="text-xs text-muted-foreground">Delivery score</p>
                <div className="text-xs space-y-0.5">
                  <p>✓ {score.fulfilled} fulfilled of {score.total}</p>
                  <p>⚠ {score.concerning} concerning</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Per-cycle details */}
      {cycleGroups.map(({ cycle, promises: cyclePromises, score }) => (
        <section key={cycle} className="space-y-4 border rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold">{cycle}</h2>
              <p className="text-sm text-muted-foreground">
                {cyclePromises.length} promise{cyclePromises.length !== 1 ? "s" : ""} · Delivery score: <strong>{score.overall}/100</strong>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {cyclePromises.map(p => (
              <div key={p.slug} className="flex items-start gap-3 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <Link href={`/promises/${p.slug}`} className="text-sm font-medium hover:underline">
                    {p.title}
                  </Link>
                  {p.ministry && (
                    <p className="text-xs text-muted-foreground">{p.ministry}</p>
                  )}
                </div>
                <StatusBadge status={p.current_status} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {unknown.length > 0 && (
        <section className="space-y-3 border rounded-lg p-4 opacity-60">
          <h2 className="text-base font-semibold">Unclassified ({unknown.length})</h2>
          <p className="text-xs text-muted-foreground">These promises have no election_cycle set.</p>
          {unknown.map(p => (
            <div key={p.slug} className="flex items-center gap-3 text-sm">
              <Link href={`/promises/${p.slug}`} className="flex-1 hover:underline truncate">{p.title}</Link>
              <StatusBadge status={p.current_status} />
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
