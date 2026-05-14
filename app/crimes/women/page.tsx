import Link from "next/link"
import { loadCrimeStats } from "@/lib/content"
import { CRIME_CATEGORIES, CRIME_CATEGORY_LABELS } from "@/lib/constants"

export const metadata = {
  title: "Crimes Against Women — Telangana — TSGOV",
  description:
    "District-level breakdown of crimes against women in Telangana — rape, POCSO, dowry death, domestic violence, molestation, trafficking, acid attacks and stalking.",
}

export default async function CrimesWomenPage() {
  const stats = await loadCrimeStats()

  const latestYear =
    Array.from(new Set(stats.map(s => s.year))).sort((a, b) =>
      b.localeCompare(a)
    )[0] ?? null

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link
          href="/crimes"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Crime dashboard
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Crimes Against Women — Telangana
        </h1>
        <p className="text-muted-foreground mt-1">
          Latest reported numbers by category and district
          {latestYear ? ` (${latestYear})` : ""}. Sourced from NCRB, Telangana
          Police and RTI disclosures.
        </p>
      </div>

      {stats.length === 0 ? (
        <div className="rounded-lg border p-6 bg-amber-50 text-amber-900">
          <p className="font-semibold">No crime statistics in the database yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {CRIME_CATEGORIES.map(cat => {
            const rows = stats.filter(
              s => s.category === cat && (latestYear ? s.year === latestYear : true)
            )
            const total = rows.reduce((acc, s) => acc + s.count, 0)
            const byDistrict = new Map<string, number>()
            for (const s of rows) {
              byDistrict.set(
                s.district,
                (byDistrict.get(s.district) ?? 0) + s.count
              )
            }
            const districtRows = Array.from(byDistrict.entries()).sort(
              (a, b) => b[1] - a[1]
            )

            return (
              <section
                key={cat}
                className="rounded-lg border p-4 space-y-3 bg-white"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold">
                    {CRIME_CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xl font-bold font-mono">
                    {total.toLocaleString("en-IN")}
                  </span>
                </div>
                {districtRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No data on record.
                  </p>
                ) : (
                  <ol className="space-y-1 text-sm">
                    {districtRows.slice(0, 6).map(([d, c]) => (
                      <li key={d} className="flex justify-between">
                        <span>{d}</span>
                        <span className="font-mono text-muted-foreground">
                          {c.toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground italic border-t pt-4">
        These figures count registered FIRs only; under-reporting is well
        documented in academic and journalistic literature. Use them as a floor,
        not a ceiling.
      </p>
    </main>
  )
}
