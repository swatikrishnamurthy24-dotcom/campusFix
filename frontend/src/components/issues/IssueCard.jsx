import { Link } from "react-router-dom"
import { MapPin, ArrowBigUp, ArrowBigDown, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import StatusBadge from "@/components/issues/StatusBadge"
import PriorityBadge from "@/components/issues/PriorityBadge"

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

/**
 * Responsive issue summary card — used by My Issues (list) and the
 * Dashboard's "Recent Issues" widget so the two never render issues
 * differently. Deliberately card-based rather than a table, per Phase 2
 * responsive guidance (no forced-wide tables on mobile).
 *
 * `to` defaults to the Student Portal's detail route so every existing
 * caller keeps working unchanged. The Staff Portal (Phase 5) passes its own
 * detail path instead of duplicating this component.
 * `showAssignee` opts in to an extra "Assigned to" line — off by default so
 * the Student Portal's card is pixel-identical to before.
 */
export default function IssueCard({ issue, to, showAssignee = false }) {
  return (
    <Link to={to ?? `/student/issues/${issue.id}`}>
      <Card className="p-4 transition-colors hover:border-primary">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{issue.id}</p>
            <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground">{issue.title}</h3>
          </div>
          <StatusBadge status={issue.status} className="shrink-0" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {issue.location}
          </span>
          <span>{issue.category}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(issue.createdAt)}
          </span>
        </div>

        {showAssignee && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {issue.assignedToName ? `Assigned to ${issue.assignedToName}` : "Unassigned"}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <PriorityBadge priority={issue.priority} />
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ArrowBigUp className="h-4 w-4" />
              {issue.upvotes}
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowBigDown className="h-4 w-4" />
              {issue.downvotes}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
