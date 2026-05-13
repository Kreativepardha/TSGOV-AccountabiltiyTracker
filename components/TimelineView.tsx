import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { TimelineEvent } from "@/lib/timeline"

const DOT_COLOR: Record<TimelineEvent["type"], string> = {
  incident:          "bg-amber-500",
  promise_update:    "bg-blue-500",
  promise_announced: "bg-slate-400",
}

const TYPE_LABEL: Record<TimelineEvent["type"], string> = {
  incident:          "Incident",
  promise_update:    "Update",
  promise_announced: "Promise",
}

export function TimelineView({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-muted-foreground text-sm">No events yet.</p>
  }

  return (
    <ol className="relative border-l border-border space-y-6 ml-2">
      {events.map((ev, i) => (
        <li key={i} className="ml-6">
          <span
            className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${DOT_COLOR[ev.type]}`}
          />
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <time className="text-xs text-muted-foreground font-mono">{ev.date}</time>
            <Badge variant="outline" className="text-xs">{TYPE_LABEL[ev.type]}</Badge>
            <span className="text-xs text-muted-foreground">{ev.category}</span>
          </div>
          <Link
            href={ev.href}
            className="font-medium text-sm hover:underline underline-offset-2"
          >
            {ev.title}
          </Link>
          {ev.note && (
            <p className="text-xs text-muted-foreground mt-1">{ev.note}</p>
          )}
        </li>
      ))}
    </ol>
  )
}
