import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  ArrowBigUp,
  ArrowBigDown,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getIssueById, voteIssue, getUserVote } from "@/services/issueService"
import { ISSUE_STATUSES } from "@/data/mockIssues"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import StatusBadge from "@/components/issues/StatusBadge"
import PriorityBadge from "@/components/issues/PriorityBadge"

function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

// The normal happy-path lifecycle, used to render the timeline.
// "Rejected" is a separate terminal branch, handled on its own below.
const HAPPY_PATH_STATUSES = ISSUE_STATUSES.filter((s) => s !== "Rejected")

function StatusTimeline({ status }) {
  if (status === "Rejected") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
        <XCircle className="h-4 w-4 shrink-0" />
        This issue was reviewed and marked as Rejected. See comments below for details.
      </div>
    )
  }

  const currentIndex = HAPPY_PATH_STATUSES.indexOf(status)

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {HAPPY_PATH_STATUSES.map((step, index) => {
        const isComplete = index <= currentIndex
        const isCurrent = index === currentIndex
        return (
          <li key={step} className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:text-center">
            <div className="flex items-center sm:w-full">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </div>
              {index < HAPPY_PATH_STATUSES.length - 1 && (
                <div
                  className={`hidden h-px flex-1 sm:block ${index < currentIndex ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
            <span className={`text-xs ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function IssueDetails() {
  const { issueId } = useParams()
  const { user } = useAuth()

  const [issue, setIssue] = useState(null)
  const [userVote, setUserVote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    // getUserVote now hits the real API (Phase 7) instead of a synchronous
    // in-memory lookup, so it's fetched alongside the issue itself rather
    // than read off the mock service's return value.
    Promise.all([getIssueById(issueId), getUserVote(issueId, user.id)])
      .then(([issueData, voteData]) => {
        if (cancelled) return
        setIssue(issueData)
        setUserVote(voteData)
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
  }, [issueId, user.id])

  async function handleVote(voteType) {
    if (isVoting) return
    setIsVoting(true)
    try {
      const result = await voteIssue(issueId, user.id, voteType)
      setIssue(result.issue)
      setUserVote(result.userVote)
    } catch {
      // Voting is non-critical to the page — fail quietly rather than
      // blocking the rest of the issue detail view.
    } finally {
      setIsVoting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg border border-border bg-muted/50" />
      </div>
    )
  }

  if (loadError || !issue) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-2 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm font-medium text-foreground">{loadError || "Issue not found."}</p>
        <Link to="/student/issues" className="mt-2 text-sm font-medium text-primary hover:underline">
          Back to My Issues
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link
        to="/student/issues"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Issues
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
          </div>

          <Separator className="my-4" />

          <p className="mb-3 text-sm font-semibold text-foreground">Status</p>
          <StatusTimeline status={issue.status} />

          <Separator className="my-4" />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={userVote === "up" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("up")}
              disabled={isVoting}
              aria-pressed={userVote === "up"}
            >
              <ArrowBigUp className="h-4 w-4" />
              {issue.upvotes}
            </Button>
            <Button
              type="button"
              variant={userVote === "down" ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote("down")}
              disabled={isVoting}
              aria-pressed={userVote === "down"}
            >
              <ArrowBigDown className="h-4 w-4" />
              {issue.downvotes}
            </Button>
            {userVote && (
              <span className="text-xs text-muted-foreground">
                You {userVote === "up" ? "upvoted" : "downvoted"} this issue.
              </span>
            )}
          </div>

          <Separator className="my-4" />

          <p className="mb-3 text-sm font-semibold text-foreground">Comments & Activity</p>
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
    </div>
  )
}
