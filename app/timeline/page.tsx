import { buildTimeline } from "@/lib/timeline"
import { TimelineView } from "@/components/TimelineView"

export const metadata = { title: "Governance Timeline" }

export default async function TimelinePage() {
  const events = await buildTimeline()

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Governance Timeline</h1>
        <p className="text-muted-foreground mt-1">
          {events.length} events — promises, updates, and incidents in chronological order
          (newest first).
        </p>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Incident
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" /> Promise update
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" /> Promise announced
        </span>
      </div>
      <TimelineView events={events} />
    </main>
  )
}
