import { Badge } from "@/components/ui/badge"
import { STATUS_COLORS } from "@/lib/constants"
import type { PromiseStatus } from "@/lib/schemas"

export function StatusBadge({ status }: { status: PromiseStatus }) {
  return (
    <Badge className={`text-xs font-medium border ${STATUS_COLORS[status]}`}>
      {status}
    </Badge>
  )
}
