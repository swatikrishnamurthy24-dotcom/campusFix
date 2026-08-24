import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Inbox,
  Hourglass,
  CheckCircle2,
  Loader,
  CheckCheck,
  XCircle,
  AlertTriangle,
  Users,
  UserCog,
  UserCheck,
  Percent,
  Search,
  UsersRound,
  Building2,
  BarChart3,
} from "lucide-react"
import { getAllIssues } from "@/services/issueService"
import { getDashboardStats, getDepartments } from "@/services/adminService"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StatCard from "@/components/admin/StatCard"
import { BarList } from "@/components/admin/BarStat"
import IssueCard from "@/components/issues/IssueCard"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [issues, setIssues] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    Promise.all([getDashboardStats(), getAllIssues(), getDepartments()])
      .then(([statsData, issuesData, deptData]) => {
        if (cancelled) return
        setStats(statsData)
        setIssues(issuesData)
        setDepartments(deptData)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load dashboard data right now. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    )
  }

  if (loadError || !stats) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-foreground">{loadError || "Something went wrong."}</p>
      </div>
    )
  }

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  const highPriorityIssues = issues
    .filter((i) => (i.priority === "High" || i.priority === "Emergency") && i.status !== "Resolved" && i.status !== "Rejected")
    .slice(0, 4)

  const emergencyIssues = issues.filter((i) => i.priority === "Emergency")

  const categoryCounts = Object.entries(
    issues.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1
      return acc
    }, {})
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  const departmentCounts = departments
    .map((d) => ({ label: d.name, count: d.issueCount }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">Campus-wide overview of issues, students, and staff.</p>
      </div>

      {/* System-level statistics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Total Issues" value={stats.totalIssues} tone="primary" />
        <StatCard icon={Hourglass} label="Pending" value={stats.pending} tone="info" />
        <StatCard icon={CheckCircle2} label="Acknowledged" value={stats.acknowledged} tone="accent" />
        <StatCard icon={Loader} label="In Progress" value={stats.inProgress} tone="warning" />
        <StatCard icon={CheckCheck} label="Resolved" value={stats.resolved} tone="success" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="danger" />
        <StatCard icon={AlertTriangle} label="Emergency Issues" value={stats.emergency} tone="danger" />
        <StatCard icon={Percent} label="Resolution Rate" value={`${stats.resolutionRate}%`} tone="success" />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} />
        <StatCard icon={UserCog} label="Total Staff" value={stats.totalStaff} />
        <StatCard icon={UserCheck} label="Active Staff" value={stats.activeStaff} tone="success" />
        <StatCard icon={AlertTriangle} label="High Priority" value={stats.highPriority} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle>Recent Issues</CardTitle>
            <Link to="/admin/issues" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issues reported yet.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {recentIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} to={`/admin/issues/${issue.id}`} showAssignee />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* High priority issues */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>High Priority Issues</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {highPriorityIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open high-priority issues right now.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {highPriorityIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} to={`/admin/issues/${issue.id}`} showAssignee />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {emergencyIssues.length > 0 && (
        <Card className="border-danger/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" />
              Emergency Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {emergencyIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} to={`/admin/issues/${issue.id}`} showAssignee />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Issue Category Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList data={categoryCounts} tone="accent" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Department Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList data={departmentCounts} tone="default" />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-0">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/issues">
              <Search className="h-4 w-4" />
              View All Issues
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/staff">
              <UsersRound className="h-4 w-4" />
              Manage Staff
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/departments">
              <Building2 className="h-4 w-4" />
              View Departments
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/analytics">
              <BarChart3 className="h-4 w-4" />
              Open Analytics
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
