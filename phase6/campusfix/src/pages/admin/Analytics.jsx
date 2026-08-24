import { useEffect, useState } from "react"
import { AlertCircle, Percent, Clock } from "lucide-react"
import { getAnalytics } from "@/services/adminService"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import StatCard from "@/components/admin/StatCard"
import { BarList, ColumnTrend } from "@/components/admin/BarStat"

function toEntries(obj) {
  return Object.entries(obj)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getAnalytics()
      .then((data) => {
        if (!cancelled) setAnalytics(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load analytics right now. Please try again.")
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
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    )
  }

  if (loadError || !analytics) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-foreground">{loadError || "Something went wrong."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground">Campus-wide issue trends and performance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard icon={Percent} label="Resolution Rate" value={`${analytics.resolutionRate}%`} tone="success" />
        <StatCard
          icon={Clock}
          label="Avg. Resolution Time"
          value={analytics.avgResolutionHours > 0 ? `${analytics.avgResolutionHours}h` : "—"}
          tone="info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList data={toEntries(analytics.byStatus)} tone="default" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Issues by Priority</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList data={toEntries(analytics.byPriority)} tone="danger" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList data={toEntries(analytics.byCategory)} tone="accent" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Issues by Department</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarList data={toEntries(analytics.byDepartment)} tone="info" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Monthly Issue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ColumnTrend data={analytics.monthlyTrend} />
        </CardContent>
      </Card>
    </div>
  )
}
