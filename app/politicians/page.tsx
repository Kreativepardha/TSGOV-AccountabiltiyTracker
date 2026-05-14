import { loadPoliticians } from "@/lib/content"
import { PoliticiansTable } from "@/components/PoliticiansTable"

export const metadata = {
  title: "Telangana Politicians — TSGOV",
  description:
    "Tracker of Telangana MLAs, MPs and Ministers — criminal cases, declared assets, and constituency data. Sourced from public ADR / MyNeta records.",
}

export default async function PoliticiansPage() {
  const politicians = await loadPoliticians()

  const totalCases = politicians.reduce(
    (acc, p) => acc + p.criminal_cases.length,
    0
  )
  const seriousCases = politicians.reduce(
    (acc, p) => acc + p.criminal_cases.filter(c => c.is_serious).length,
    0
  )

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Telangana Politicians</h1>
        <p className="text-muted-foreground mt-1">
          {politicians.length} elected representatives tracked. Criminal-case and
          asset data is sourced from public{" "}
          <a
            href="https://myneta.info"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            ADR / MyNeta
          </a>{" "}
          records and may be approximate.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Politicians tracked", value: politicians.length },
          { label: "Total criminal cases", value: totalCases },
          { label: "Serious cases (>5yr)", value: seriousCases },
          {
            label: "Ministers",
            value: politicians.filter(p =>
              ["Minister", "CM", "Deputy CM"].includes(p.position)
            ).length,
          },
        ].map(s => (
          <div key={s.label} className="rounded-lg border p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {politicians.length === 0 ? (
        <p className="text-muted-foreground">
          No politicians in the database yet. Run the seed script.
        </p>
      ) : (
        <PoliticiansTable politicians={politicians} />
      )}

      <p className="text-xs text-muted-foreground italic border-t pt-4">
        Disclaimer: All criminal-case data shown is from publicly filed
        affidavits and reflects allegations or pending matters unless explicitly
        marked “convicted”. Asset figures are approximate per ADR public records.
      </p>
    </main>
  )
}
