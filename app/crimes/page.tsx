import Link from "next/link"
import { loadCrimeStats } from "@/lib/content"
import { CrimesDashboard } from "@/components/CrimesDashboard"

export const metadata = {
  title: "Telangana Crime Dashboard — TSGOV",
  description:
    "Reported crimes against women across Telangana districts. Data from NCRB, TS Police and RTI responses.",
}

export default async function CrimesPage() {
  const stats = await loadCrimeStats()

  const years = Array.from(new Set(stats.map(s => s.year))).sort((a, b) =>
    b.localeCompare(a)
  )
  const latest = years[0]
  const prev = years[1]
  const latestTotal = stats
    .filter(s => s.year === latest)
    .reduce((a, s) => a + s.count, 0)
  const prevTotal = stats
    .filter(s => s.year === prev)
    .reduce((a, s) => a + s.count, 0)
  const yoyPct =
    prev && prevTotal > 0
      ? Math.round(((latestTotal - prevTotal) / prevTotal) * 100)
      : null

  const byDistrict = new Map<string, number>()
  for (const s of stats.filter(s => s.year === latest)) {
    byDistrict.set(s.district, (byDistrict.get(s.district) ?? 0) + s.count)
  }
  const top5 = Array.from(byDistrict.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telangana Crime Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Reported crimes against women across Telangana districts. Sourced from
          NCRB, Telangana Police and RTI disclosures. See also our{" "}
          <Link href="/crimes/women" className="underline">
            focused page on crimes against women
          </Link>
          .
        </p>
      </div>

      {stats.length === 0 ? (
        <div className="rounded-lg border p-6 bg-amber-50 text-amber-900">
          <p className="font-semibold">No crime statistics in the database yet.</p>
          <p className="text-sm mt-1">
            Populate <code className="bg-amber-100 px-1 rounded">CrimeStatistic</code>{" "}
            via the admin tools or a seed script.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">
                {latestTotal.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-muted-foreground">
                Total reported{latest ? ` (${latest})` : ""}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p
                className={`text-2xl font-bold ${
                  yoyPct === null
                    ? ""
                    : yoyPct > 0
                    ? "text-red-600"
                    : "text-emerald-600"
                }`}
              >
                {yoyPct === null ? "—" : `${yoyPct > 0 ? "+" : ""}${yoyPct}%`}
              </p>
              <p className="text-sm text-muted-foreground">
                Year-over-year change
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{byDistrict.size}</p>
              <p className="text-sm text-muted-foreground">Districts with data</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{top5[0]?.[0] ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Top district</p>
            </div>
          </div>

          {top5.length > 0 && (
            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-semibold">
                Top 5 districts {latest ? `(${latest})` : ""}
              </h2>
              <ol className="space-y-1 text-sm">
                {top5.map(([d, c], i) => (
                  <li key={d} className="flex justify-between">
                    <span>
                      {i + 1}. {d}
                    </span>
                    <span className="font-mono">{c.toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <CrimesDashboard stats={stats} />
        </>
      )}

      <p className="text-xs text-muted-foreground italic border-t pt-4">
        Data sources: National Crime Records Bureau (NCRB) annual reports,
        Telangana State Police, and RTI responses. Reported numbers reflect
        registered FIRs and may understate actual incidence.
      </p>
    </main>
  )
}
