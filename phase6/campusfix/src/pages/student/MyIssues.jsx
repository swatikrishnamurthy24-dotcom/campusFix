import { useEffect, useMemo, useState } from "react"
import { Search, Inbox, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getStudentIssues } from "@/services/issueService"
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/data/mockIssues"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import IssueCard from "@/components/issues/IssueCard"

const ALL = "all"

export default function MyIssues() {
  const { user } = useAuth()

  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [categoryFilter, setCategoryFilter] = useState(ALL)
  const [priorityFilter, setPriorityFilter] = useState(ALL)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getStudentIssues(user.id)
      .then((data) => {
        if (!cancelled) setIssues(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load your issues right now. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user.id])

  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase()

    let result = issues.filter((issue) => {
      const matchesSearch =
        !query ||
        issue.title.toLowerCase().includes(query) ||
        issue.id.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query)
      const matchesStatus = statusFilter === ALL || issue.status === statusFilter
      const matchesCategory = categoryFilter === ALL || issue.category === categoryFilter
      const matchesPriority = priorityFilter === ALL || issue.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority
    })

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortBy === "most-upvoted") return b.upvotes - a.upvotes
      return 0
    })

    return result
  }, [issues, search, statusFilter, categoryFilter, priorityFilter, sortBy])

  const hasAnyIssues = issues.length > 0
  const hasActiveFilters =
    search.trim() || statusFilter !== ALL || categoryFilter !== ALL || priorityFilter !== ALL

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">My Issues</h2>
        <p className="text-sm text-muted-foreground">Track every issue you've reported.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, ID, or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Search my issues"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by status">
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

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="sm:w-40" aria-label="Sort issues">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="most-upvoted">Most upvoted</SelectItem>
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
          <p className="text-sm font-medium text-foreground">No issues reported yet.</p>
          <p className="text-sm text-muted-foreground">Issues you report will show up here.</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No issues match your filters.</p>
          {hasActiveFilters && <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  )
}
