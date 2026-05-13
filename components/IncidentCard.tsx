import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { EvidenceBadge } from "./EvidenceBadge"
import type { IncidentFrontmatter } from "@/lib/schemas"

type IncidentWithBody = IncidentFrontmatter & { body: string }

export function IncidentCard({ incident }: { incident: IncidentWithBody }) {
  const preview = incident.body.replace(/^#+.*$/gm, "").trim().slice(0, 200)

  return (
    <div className="border rounded-lg p-4 space-y-2 hover:border-foreground/30 transition-colors">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground font-mono">{incident.date}</span>
        <Badge variant="outline" className="text-xs">{incident.category}</Badge>
        <EvidenceBadge grade={incident.evidence_grade} />
        {incident.district !== "Statewide" && (
          <Badge variant="secondary" className="text-xs">{incident.district}</Badge>
        )}
      </div>
      <Link href={`/incidents/${incident.slug}`} className="hover:underline block">
        <h3 className="font-semibold leading-snug">{incident.title}</h3>
      </Link>
      {preview && (
        <p className="text-sm text-muted-foreground line-clamp-2">{preview}…</p>
      )}
      <p className="text-xs text-muted-foreground">
        Sources: {incident.sources.map(s => s.outlet).join(", ")}
      </p>
    </div>
  )
}
