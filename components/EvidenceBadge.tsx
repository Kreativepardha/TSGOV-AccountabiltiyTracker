import { Badge } from "@/components/ui/badge"
import { EVIDENCE_GRADE_COLORS } from "@/lib/constants"
import type { EvidenceGrade } from "@/lib/schemas"

export function EvidenceBadge({ grade }: { grade: EvidenceGrade }) {
  return (
    <Badge className={`text-xs font-medium border ${EVIDENCE_GRADE_COLORS[grade]}`}>
      {grade}
    </Badge>
  )
}
