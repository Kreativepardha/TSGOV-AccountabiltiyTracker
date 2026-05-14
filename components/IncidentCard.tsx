import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { EvidenceBadge } from "./EvidenceBadge"
import { DEMOGRAPHIC_LABELS } from "@/lib/constants"
import type { IncidentFrontmatter } from "@/lib/schemas"

type IncidentWithBody = IncidentFrontmatter & { body: string }

const DEMOGRAPHIC_BADGE_CLASS: Record<string, string> = {
  "women":    "bg-rose-100 text-rose-800 border-rose-200",
  "SC/ST":    "bg-amber-100 text-amber-800 border-amber-200",
  "minor":    "bg-purple-100 text-purple-800 border-purple-200",
  "minority": "bg-teal-100 text-teal-800 border-teal-200",
  "general":  "bg-gray-100 text-gray-700 border-gray-200",
}

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
        {incident.affected_demographic && (
          <Badge
            variant="outline"
            className={`text-xs ${
              DEMOGRAPHIC_BADGE_CLASS[incident.affected_demographic] ?? ""
            }`}
          >
            Affected: {DEMOGRAPHIC_LABELS[incident.affected_demographic] ??
              incident.affected_demographic}
          </Badge>
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
