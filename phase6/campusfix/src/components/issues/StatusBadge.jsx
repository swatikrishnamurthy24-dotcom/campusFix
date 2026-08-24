import { Badge } from "@/components/ui/badge"
import { STATUS_BADGE_VARIANT } from "@/data/mockIssues"

/** Consistent status → color mapping wherever an issue status is shown. */
export default function StatusBadge({ status, className }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status] ?? "muted"} className={className}>
      {status}
    </Badge>
  )
}
