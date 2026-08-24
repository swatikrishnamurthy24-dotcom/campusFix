import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PRIORITY_BADGE_VARIANT } from "@/data/mockIssues"

/** Consistent priority → color mapping. Emergency also gets an icon so it
 * never depends on color alone (accessibility — Phase 2 §9). */
export default function PriorityBadge({ priority, className }) {
  return (
    <Badge variant={PRIORITY_BADGE_VARIANT[priority] ?? "muted"} className={className}>
      {priority === "Emergency" && <AlertTriangle className="mr-1 h-3 w-3" />}
      {priority}
    </Badge>
  )
}
