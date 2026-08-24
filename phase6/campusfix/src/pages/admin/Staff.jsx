import { useEffect, useMemo, useState } from "react"
import { Search, UsersRound, AlertCircle, Eye } from "lucide-react"
import { getStaffList } from "@/services/adminService"
import { STAFF_DEPARTMENTS, STAFF_STATUSES } from "@/data/mockStaff"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const ALL = "all"

const STATUS_BADGE = {
  Active: "success",
  "On Leave": "warning",
  Inactive: "muted",
}

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState(ALL)
  const [statusFilter, setStatusFilter] = useState(ALL)
  const [selectedStaff, setSelectedStaff] = useState(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getStaffList()
      .then((data) => {
        if (!cancelled) setStaff(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load staff right now. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase()
    return staff.filter((s) => {
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.staffId.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      const matchesDepartment = departmentFilter === ALL || s.department === departmentFilter
      const matchesStatus = statusFilter === ALL || s.status === statusFilter
      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [staff, search, departmentFilter, statusFilter])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Staff</h2>
        <p className="text-sm text-muted-foreground">Maintenance staff directory across all departments.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:min-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, staff ID, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Search staff"
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by department">
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
          <SelectTrigger className="sm:w-36" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STAFF_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-foreground">{loadError}</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <UsersRound className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No staff match your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden rounded-lg border border-border bg-surface sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.staffId}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.specialization}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[s.status] ?? "muted"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell>{s.assignedIssueCount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(s)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 sm:hidden">
            {filteredStaff.map((s) => (
              <Card key={s.id} className="p-4">
                <CardContent className="space-y-2 p-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.staffId}</p>
                    </div>
                    <Badge variant={STATUS_BADGE[s.status] ?? "muted"}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.department} · {s.assignedIssueCount} assigned
                  </p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedStaff(s)}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={Boolean(selectedStaff)} onOpenChange={(open) => !open && setSelectedStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStaff?.name}</DialogTitle>
            <DialogDescription>{selectedStaff?.staffId}</DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-foreground">Email: </span>
                <span className="text-muted-foreground">{selectedStaff.email}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Department: </span>
                <span className="text-muted-foreground">{selectedStaff.department}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Specialization: </span>
                <span className="text-muted-foreground">{selectedStaff.specialization}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Status: </span>
                <span className="text-muted-foreground">{selectedStaff.status}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Assigned Issues: </span>
                <span className="text-muted-foreground">{selectedStaff.assignedIssueCount}</span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
