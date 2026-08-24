import { FilePlus2, UserPlus, RefreshCcw, AlertTriangle, MessageSquare, Activity } from "lucide-react"

const TYPE_META = {
  created: { icon: FilePlus2, tone: "bg-muted text-muted-foreground" },
  assigned: { icon: UserPlus, tone: "bg-info/15 text-info" },
  status: { icon: RefreshCcw, tone: "bg-primary/15 text-primary" },
  priority: { icon: AlertTriangle, tone: "bg-accent/15 text-accent" },
  comment: { icon: MessageSquare, tone: "bg-success/15 text-success" },
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Vertical activity/history log for an issue — created, assigned, status
 * changes, priority changes, comments. Distinct from the happy-path status
 * stepper used elsewhere: this is a chronological event list, not a
 * progress indicator. Used by the Staff Portal's Issue Details page
 * (Phase 5 §8), kept generic enough to reuse from other portals later.
 */
export default function ActivityTimeline({ events }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
  }

  return (
    <ol className="space-y-4">
      {events.map((event, index) => {
        const meta = TYPE_META[event.type] ?? { icon: Activity, tone: "bg-muted text-muted-foreground" }
        const Icon = meta.icon
        const isLast = index === events.length - 1
        return (
          <li key={event.id} className="relative flex gap-3 pl-0">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
            </div>
            <div className="min-w-0 flex-1 pb-4">
              <p className="text-sm text-foreground">{event.message}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {event.user} · {formatDateTime(event.timestamp)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
