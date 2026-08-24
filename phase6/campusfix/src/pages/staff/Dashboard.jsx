import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ClipboardList,
  Inbox,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Bell,
  ListChecks,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getAssignedIssues, getNotifications } from "@/services/issueService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import IssueCard from "@/components/issues/IssueCard"

const STAT_CARDS = [
  { key: "total", label: "Total Assigned", icon: ClipboardList, tone: "text-primary" },
  { key: "pending", label: "Pending", icon: Inbox, tone: "text-info" },
  { key: "inProgress", label: "In Progress", icon: Clock3, tone: "text-warning" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, tone: "text-success" },
  { key: "highPriority", label: "High Priority", icon: AlertTriangle, tone: "text-accent" },
  { key: "emergency", label: "Emergency", icon: Siren, tone: "text-danger" },
]

export default function StaffDashboard() {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAssignedIssues(user.id), getNotifications(user.id)]).then(([issueData, notifData]) => {
      if (cancelled) return
      setIssues(issueData)
      setNotifications(notifData.filter((n) => !n.read).slice(0, 3))
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user.id])

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "Pending").length,
    inProgress: issues.filter((i) => i.status === "In Progress" || i.status === "Acknowledged").length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
    highPriority: issues.filter((i) => i.priority === "High").length,
    emergency: issues.filter((i) => i.priority === "Emergency").length,
  }

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Welcome + quick actions */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Welcome back, {user.name.split(" ")[0]} 👋</h2>
          <p className="text-sm text-muted-foreground">Here's what's on your plate today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/staff/notifications">
              <Bell className="h-4 w-4" />
              Notifications
            </Link>
          </Button>
          <Button asChild>
            <Link to="/staff/assigned-issues">
              <ListChecks className="h-4 w-4" />
              View Assigned Issues
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, tone }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {isLoading ? "–" : stats[key]}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent assigned issues */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Assigned Issues</h3>
            <Link to="/staff/assigned-issues" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-muted/50" />
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <Inbox className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No issues are currently assigned to you.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} to={`/staff/assigned-issues/${issue.id}`} />
              ))}
            </div>
          )}
        </div>

        {/* Recent notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Notifications</h3>
            <Link to="/staff/notifications" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg border border-border bg-muted/50" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
              <Bell className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">You're all caught up.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
