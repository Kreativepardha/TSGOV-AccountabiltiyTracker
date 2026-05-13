import { loadIncidents } from "@/lib/content"
import { IncidentCard } from "@/components/IncidentCard"

export const metadata = { title: "Incident Tracker" }

export default async function IncidentsPage() {
  const incidents = await loadIncidents()

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident & Controversy Tracker</h1>
        <p className="text-muted-foreground mt-1">
          {incidents.length} documented incidents. All entries sourced from credible news
          reports, government records, or RTI responses. Sorted by date (newest first).
        </p>
      </div>
      {incidents.length === 0 ? (
        <p className="text-muted-foreground">No incidents documented yet.</p>
      ) : (
        <div className="space-y-4">
          {incidents.map(i => (
            <IncidentCard key={i.slug} incident={i} />
          ))}
        </div>
      )}
    </main>
  )
}
