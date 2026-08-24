import { useEffect, useState } from "react"
import { UserPlus, UserMinus, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getStaffList } from "@/services/adminService"
import { assignIssue, unassignIssue } from "@/services/issueService"
import { CATEGORY_TO_DEPARTMENT } from "@/data/mockDepartments"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"

/**
 * Reusable assignment UI (Phase 6 §4). Suggests staff from the department
 * that matches the issue's category (CATEGORY_TO_DEPARTMENT,
 * src/data/mockDepartments.js) but does not enforce it — any staff member
 * can still be picked, per Phase 6 §4/§16 ("do not make this an enforced
 * production authorization rule yet").
 */
export default function AssignStaffDialog({ issue, onAssigned, trigger }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState(issue.assignedTo ?? "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const suggestedDepartment = CATEGORY_TO_DEPARTMENT[issue.category]

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIsLoading(true)
    setError("")
    setSelectedStaffId(issue.assignedTo ?? "")

    getStaffList()
      .then((data) => {
        if (!cancelled) setStaffList(data)
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load staff. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, issue.assignedTo])

  const suggested = staffList.filter((s) => s.department === suggestedDepartment)
  const others = staffList.filter((s) => s.department !== suggestedDepartment)

  async function handleAssign() {
    if (!selectedStaffId) return
    const staffMember = staffList.find((s) => s.id === selectedStaffId)
    if (!staffMember) return

    setIsSaving(true)
    setError("")
    try {
      const updated = await assignIssue(issue.id, staffMember.id, staffMember.name, {
        name: user.name,
        role: user.role,
      })
      onAssigned?.(updated)
      setOpen(false)
    } catch (err) {
      setError(err.message || "Couldn't assign this issue. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUnassign() {
    setIsSaving(true)
    setError("")
    try {
      const updated = await unassignIssue(issue.id, { name: user.name, role: user.role })
      onAssigned?.(updated)
      setOpen(false)
    } catch (err) {
      setError(err.message || "Couldn't unassign this issue. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" size="sm">
            <UserPlus className="h-4 w-4" />
            {issue.assignedTo ? "Reassign" : "Assign Staff"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{issue.assignedTo ? "Reassign Issue" : "Assign Issue"}</DialogTitle>
          <DialogDescription>
            {issue.id} · {issue.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {suggestedDepartment && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Suggested department for {issue.category}: <span className="font-medium text-foreground">{suggestedDepartment}</span>
            </p>
          )}

          <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={isLoading}>
            <SelectTrigger aria-label="Select staff member">
              <SelectValue placeholder={isLoading ? "Loading staff…" : "Select a staff member"} />
            </SelectTrigger>
            <SelectContent>
              {suggested.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Suggested — {suggestedDepartment}</SelectLabel>
                  {suggested.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.assignedIssueCount} assigned)
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              {others.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Other staff</SelectLabel>
                  {others.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.department} ({s.assignedIssueCount} assigned)
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>

          {issue.assignedToName && (
            <p className="text-xs text-muted-foreground">Currently assigned to {issue.assignedToName}.</p>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <DialogFooter>
          {issue.assignedTo && (
            <Button type="button" variant="outline" onClick={handleUnassign} disabled={isSaving}>
              <UserMinus className="h-4 w-4" />
              Unassign
            </Button>
          )}
          <Button type="button" onClick={handleAssign} disabled={isSaving || !selectedStaffId}>
            {isSaving ? "Saving…" : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
