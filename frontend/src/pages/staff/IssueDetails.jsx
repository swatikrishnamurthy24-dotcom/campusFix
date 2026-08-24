import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Clock, User, AlertCircle, Send } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getIssueById, updateIssueStatus, updateIssuePriority, addIssueComment } from "@/services/issueService"
import { ISSUE_STATUSES, ISSUE_PRIORITIES } from "@/data/mockIssues"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import StatusBadge from "@/components/issues/StatusBadge"
import PriorityBadge from "@/components/issues/PriorityBadge"
import ActivityTimeline from "@/components/issues/ActivityTimeline"

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function StaffIssueDetails() {
  const { issueId } = useParams()
  const { user } = useAuth()

  const [issue, setIssue] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isSavingPriority, setIsSavingPriority] = useState(false)
  const [statusError, setStatusError] = useState("")
  const [priorityError, setPriorityError] = useState("")

  const [commentDraft, setCommentDraft] = useState("")
  const [commentError, setCommentError] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getIssueById(issueId)
      .then((data) => {
        if (!cancelled) setIssue(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "This issue could not be loaded.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [issueId])

  async function handleStatusChange(nextStatus) {
    if (!issue || nextStatus === issue.status || isSavingStatus) return
    setIsSavingStatus(true)
    setStatusError("")
    try {
      const updated = await updateIssueStatus(issue.id, nextStatus, { name: user.name, role: user.role })
      setIssue(updated)
    } catch (err) {
      setStatusError(err.message || "Couldn't update status. Please try again.")
    } finally {
      setIsSavingStatus(false)
    }
  }

  async function handlePriorityChange(nextPriority) {
    if (!issue || nextPriority === issue.priority || isSavingPriority) return
    setIsSavingPriority(true)
    setPriorityError("")
    try {
      const updated = await updateIssuePriority(issue.id, nextPriority, { name: user.name, role: user.role })
      setIssue(updated)
    } catch (err) {
      setPriorityError(err.message || "Couldn't update priority. Please try again.")
    } finally {
      setIsSavingPriority(false)
    }
  }

  async function handleCommentSubmit(e) {
    e.preventDefault()
    if (!commentDraft.trim()) {
      setCommentError("Comment cannot be empty.")
      return
    }
    setIsSubmittingComment(true)
    setCommentError("")
    try {
      const updated = await addIssueComment(issue.id, {
        text: commentDraft,
        author: user.name,
        role: user.role,
      })
      setIssue(updated)
      setCommentDraft("")
    } catch (err) {
      setCommentError(err.message || "Couldn't post your comment. Please try again.")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/50" />
      </div>
    )
  }

  if (loadError || !issue) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-foreground">{loadError || "Issue not found."}</p>
        <Link to="/staff/assigned-issues" className="mt-2 text-sm font-medium text-primary hover:underline">
          Back to Assigned Issues
        </Link>
      </div>
    )
  }

  const activityEvents = [...(issue.activity ?? [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  )

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to="/staff/assigned-issues"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assigned Issues
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{issue.id}</p>
              <h1 className="mt-0.5 text-lg font-semibold text-foreground">{issue.title}</h1>
            </div>
            <StatusBadge status={issue.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {[issue.building, issue.floor, issue.room].filter(Boolean).join(" · ") || issue.location}
            </span>
            <span>{issue.category}</span>
            <PriorityBadge priority={issue.priority} />
          </div>

          <Separator className="my-4" />

          <p className="text-sm leading-relaxed text-foreground">{issue.description}</p>

          {issue.image && (
            <img
              src={issue.image}
              alt={`Attachment for ${issue.title}`}
              className="mt-4 max-h-72 w-full rounded-md border border-border object-cover"
            />
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              Reported by {issue.reportedByName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Reported {formatDateTime(issue.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDateTime(issue.updatedAt)}
            </span>
            <span>{issue.assignedToName ? `Assigned to ${issue.assignedToName}` : "Unassigned"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Status + priority management */}
      <Card>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="issue-status" className="text-sm font-medium text-foreground">
              Status
            </label>
            <Select value={issue.status} onValueChange={handleStatusChange} disabled={isSavingStatus}>
              <SelectTrigger id="issue-status" aria-label="Update issue status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusError && <p className="text-xs text-danger">{statusError}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="issue-priority" className="text-sm font-medium text-foreground">
              Priority
            </label>
            <Select value={issue.priority} onValueChange={handlePriorityChange} disabled={isSavingPriority}>
              <SelectTrigger id="issue-priority" aria-label="Update issue priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {priorityError && <p className="text-xs text-danger">{priorityError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Add comment */}
      <Card>
        <CardContent className="p-6">
          <p className="mb-3 text-sm font-semibold text-foreground">Add an Update</p>
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <Textarea
              placeholder="Share a status update or note for this issue…"
              value={commentDraft}
              onChange={(e) => {
                setCommentDraft(e.target.value)
                if (commentError) setCommentError("")
              }}
              aria-label="Add a comment"
              aria-invalid={Boolean(commentError)}
              disabled={isSubmittingComment}
            />
            {commentError && <p className="text-xs text-danger">{commentError}</p>}
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={isSubmittingComment}>
                <Send className="h-4 w-4" />
                {isSubmittingComment ? "Posting…" : "Post Update"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className="p-6">
          <p className="mb-3 text-sm font-semibold text-foreground">Comments</p>
          {issue.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-3">
              {issue.comments.map((comment) => (
                <li key={comment.id} className="rounded-md border border-border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{comment.text}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Activity timeline */}
      <Card>
        <CardContent className="p-6">
          <p className="mb-4 text-sm font-semibold text-foreground">Activity Timeline</p>
          <ActivityTimeline events={activityEvents} />
        </CardContent>
      </Card>
    </div>
  )
}
