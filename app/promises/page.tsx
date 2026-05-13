import { loadPromises } from "@/lib/content"
import { PromisesTable } from "@/components/PromisesTable"

export const metadata = { title: "Poll Promises Tracker" }

export default async function PromisesPage() {
  const promises = await loadPromises()

  const counts = {
    total: promises.length,
    fulfilled: promises.filter(p => p.current_status === "Fulfilled").length,
    inProgress: promises.filter(p => p.current_status === "In Progress").length,
    delayed: promises.filter(p => ["Delayed", "Abandoned"].includes(p.current_status)).length,
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Poll Promises Tracker</h1>
        <p className="text-muted-foreground mt-1">
          Tracking {counts.total} promises from the 2023 Telangana Congress manifesto and
          Six Guarantees. Last updated: {new Date().toLocaleDateString("en-IN")}.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total },
          { label: "Fulfilled", value: counts.fulfilled },
          { label: "In Progress", value: counts.inProgress },
          { label: "Delayed / Abandoned", value: counts.delayed },
        ].map(s => (
          <div key={s.label} className="rounded-lg border p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <PromisesTable promises={promises} />
    </main>
  )
}
