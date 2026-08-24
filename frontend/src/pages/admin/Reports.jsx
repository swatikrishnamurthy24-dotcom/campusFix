import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Download } from "lucide-react"
import { getAllIssues } from "@/services/issueService"
import { ISSUE_CATEGORIES } from "@/data/mockIssues"
import { STAFF_DEPARTMENTS } from "@/data/mockStaff"
import { CATEGORY_TO_DEPARTMENT } from "@/data/mockDepartments"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StatCard from "@/components/admin/StatCard"
import { BarList } from "@/components/admin/BarStat"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const ALL = "all"
const DATE_RANGES = [
  { value: ALL, label: "All time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
]

function toEntries(obj) {
  return Object.entries(obj)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

export default function Reports() {
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [dateFilter, setDateFilter] = useState(ALL)
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [departmentFilter, setDepartmentFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getAllIssues()
      .then((data) => {
        if (!cancelled) setIssues(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load report data right now. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredIssues = useMemo(() => {
    const now = Date.now()
    return issues.filter((issue) => {
      const matchesDate =
        dateFilter === ALL || now - new Date(issue.createdAt).getTime() <= Number(dateFilter) * 24 * 60 * 60 * 1000
      const matchesCategory = categoryFilter === ALL || issue.category === categoryFilter
      const matchesDepartment =
        departmentFilter === ALL || CATEGORY_TO_DEPARTMENT[issue.category] === departmentFilter
      const matchesStatus = statusFilter === ALL || issue.status === statusFilter
      return matchesDate && matchesCategory && matchesDepartment && matchesStatus
    })
  }, [issues, dateFilter, categoryFilter, departmentFilter, statusFilter])

  const total = filteredIssues.length
  const resolved = filteredIssues.filter((i) => i.status === "Resolved").length
  const pending = filteredIssues.filter((i) => i.status === "Pending").length
  const highOrEmergency = filteredIssues.filter((i) => i.priority === "High" || i.priority === "Emergency").length

  const categoryBreakdown = toEntries(
    filteredIssues.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] ?? 0) + 1
      return acc
    }, {})
  )

  const departmentBreakdown = toEntries(
    filteredIssues.reduce((acc, i) => {
      const dept = CATEGORY_TO_DEPARTMENT[i.category] ?? "Unassigned"
      acc[dept] = (acc[dept] ?? 0) + 1
      return acc
    }, {})
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reports</h2>
          <p className="text-sm text-muted-foreground">Report-style summaries, filtered on the fly.</p>
        </div>
        <Button variant="outline" size="sm" disabled title="Export is a future capability — not implemented in this phase">
          <Download className="h-4 w-4" />
          Export (Coming Soon)
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by date range">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {ISSUE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by department">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All departments</SelectItem>
            {STAFF_DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Acknowledged">Acknowledged</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-foreground">{loadError}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Issues" value={total} tone="primary" />
            <StatCard label="Resolved" value={resolved} tone="success" />
            <StatCard label="Pending" value={pending} tone="info" />
            <StatCard label="High / Emergency" value={highOrEmergency} tone="danger" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Based on the filters selected above.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <BarList data={categoryBreakdown} tone="accent" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Department Breakdown</CardTitle>
                <CardDescription>Based on the filters selected above.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <BarList data={departmentBreakdown} tone="info" />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
