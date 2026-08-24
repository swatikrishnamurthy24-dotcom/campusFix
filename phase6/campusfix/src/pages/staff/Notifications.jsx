import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Bell, CheckCheck, UserPlus, Siren, RefreshCcw, Info, BellOff } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/issueService"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Staff notification types (Phase 5 §9) differ from the Student Portal's
// (status/vote/comment) — separate icon map, same getNotifications()
// abstraction underneath.
const TYPE_ICON = {
  assigned: UserPlus,
  emergency: Siren,
  status: RefreshCcw,
  info: Info,
}

function formatRelativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" })
}

export default function StaffNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getNotifications(user.id).then((data) => {
      if (!cancelled) {
        setNotifications(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user.id])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await markNotificationRead(id)
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await markAllNotificationsRead(user.id)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <BellOff className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell
            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                  n.read ? "bg-surface" : "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    n.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", n.read ? "font-medium text-foreground" : "font-semibold text-foreground")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </div>
              </div>
            )

            return (
              <li key={n.id}>
                {n.issueId ? (
                  <Link to={`/staff/assigned-issues/${n.issueId}`} onClick={() => !n.read && handleMarkRead(n.id)}>
                    {content}
                  </Link>
                ) : (
                  <button type="button" className="w-full text-left" onClick={() => !n.read && handleMarkRead(n.id)}>
                    {content}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
