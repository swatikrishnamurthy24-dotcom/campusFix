import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PlusCircle, ListChecks, Clock3, CheckCircle2, Bell, Inbox } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getStudentIssues, getNotifications } from "@/services/issueService"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import IssueCard from "@/components/issues/IssueCard"

const STAT_CARDS = [
  { key: "total", label: "Total Reported", icon: ListChecks, tone: "text-primary" },
  { key: "pending", label: "Pending", icon: Inbox, tone: "text-info" },
  { key: "inProgress", label: "In Progress", icon: Clock3, tone: "text-warning" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, tone: "text-success" },
]

function formatRelativeTime(iso) {
  const diffHours = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60))
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([getStudentIssues(user.id), getNotifications(user.id)]).then(([issueData, notifData]) => {
      if (cancelled) return
      setIssues(issueData)
      setNotifications(notifData.slice(0, 3))
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
  }

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome + quick action */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Welcome back, {user.name.split(" ")[0]} 👋</h2>
          <p className="text-sm text-muted-foreground">Here's what's happening with your reported issues.</p>
        </div>
        <Button asChild>
          <Link to="/student/report">
            <PlusCircle className="h-4 w-4" />
            Report Issue
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
        {/* Recent issues */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Issues</h3>
            <Link to="/student/issues" className="text-xs font-medium text-primary hover:underline">
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
              <p className="text-sm font-medium text-foreground">No issues reported yet.</p>
              <Button asChild size="sm" variant="outline" className="mt-1">
                <Link to="/student/report">Report your first issue</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* Recent notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Notifications</h3>
            <Link to="/student/notifications" className="text-xs font-medium text-primary hover:underline">
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
              <p className="text-sm font-medium text-foreground">No notifications yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id} className="rounded-lg border border-border bg-surface p-3">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
