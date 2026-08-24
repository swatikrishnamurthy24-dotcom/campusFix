import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search, Inbox, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { getAllIssues } from "@/services/issueService"
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/data/mockIssues"
import { STAFF_DEPARTMENTS } from "@/data/mockStaff"
import { CATEGORY_TO_DEPARTMENT } from "@/data/mockDepartments"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import StatusBadge from "@/components/issues/StatusBadge"
import PriorityBadge from "@/components/issues/PriorityBadge"
import IssueCard from "@/components/issues/IssueCard"

const ALL = "all"
const PAGE_SIZE = 8
const DATE_RANGES = [
  { value: ALL, label: "Any time" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
]

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export default function AllIssues() {
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [priorityFilter, setPriorityFilter] = useState(ALL)
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [departmentFilter, setDepartmentFilter] = useState(ALL)
  const [dateFilter, setDateFilter] = useState(ALL)
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getAllIssues()
      .then((data) => {
        if (!cancelled) setIssues(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load issues right now. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase()
    const now = Date.now()

    let result = issues.filter((issue) => {
      const matchesSearch =
        !query ||
        issue.title.toLowerCase().includes(query) ||
        issue.id.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.reportedByName.toLowerCase().includes(query) ||
        (issue.assignedToName ?? "").toLowerCase().includes(query)
      const matchesStatus = statusFilter === ALL || issue.status === statusFilter
      const matchesPriority = priorityFilter === ALL || issue.priority === priorityFilter
      const matchesCategory = categoryFilter === ALL || issue.category === categoryFilter
      const matchesDepartment =
        departmentFilter === ALL || CATEGORY_TO_DEPARTMENT[issue.category] === departmentFilter
      const matchesDate =
        dateFilter === ALL ||
        now - new Date(issue.createdAt).getTime() <= Number(dateFilter) * 24 * 60 * 60 * 1000

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDepartment && matchesDate
    })

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === "recently-updated") return new Date(b.updatedAt) - new Date(a.updatedAt)
      if (sortBy === "priority") {
        const order = { Emergency: 0, High: 1, Medium: 2, Low: 3 }
        return (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
      }
      return 0
    })

    return result
  }, [issues, search, statusFilter, priorityFilter, categoryFilter, departmentFilter, dateFilter, sortBy])

  // Reset to page 1 whenever the filtered set changes shape.
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, priorityFilter, categoryFilter, departmentFilter, dateFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / PAGE_SIZE))
  const pagedIssues = filteredIssues.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasAnyIssues = issues.length > 0
  const hasActiveFilters =
    search.trim() ||
    statusFilter !== ALL ||
    priorityFilter !== ALL ||
    categoryFilter !== ALL ||
    departmentFilter !== ALL ||
    dateFilter !== ALL

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">All Issues</h2>
        <p className="text-sm text-muted-foreground">Every issue reported across campus.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, ID, location, student, or staff"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Search issues"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-36" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {ISSUE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="sm:w-36" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {ISSUE_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
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

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by date reported">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="sm:w-44" aria-label="Sort issues">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="recently-updated">Recently updated</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content states */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-foreground">{loadError}</p>
        </div>
      ) : !hasAnyIssues ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No issues have been reported yet.</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No issues match your filters.</p>
          {hasActiveFilters && <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>}
        </div>
      ) : (
        <>
          {/* Desktop: table. Mobile: responsive cards (Phase 6 §2/§18). */}
          <div className="hidden rounded-lg border border-border bg-surface sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Assigned Staff</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedIssues.map((issue) => (
                  <TableRow key={issue.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link to={`/admin/issues/${issue.id}`} className="text-primary hover:underline">
                        {issue.id}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      <Link to={`/admin/issues/${issue.id}`} className="hover:underline">
                        {issue.title}
                      </Link>
                    </TableCell>
                    <TableCell>{issue.category}</TableCell>
                    <TableCell>{issue.location}</TableCell>
                    <TableCell>{issue.reportedByName}</TableCell>
                    <TableCell>{issue.assignedToName ?? "Unassigned"}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={issue.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={issue.status} />
                    </TableCell>
                    <TableCell>{formatDate(issue.createdAt)}</TableCell>
                    <TableCell>{formatDate(issue.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 sm:hidden">
            {pagedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} to={`/admin/issues/${issue.id}`} showAssignee />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {filteredIssues.length} issues
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
