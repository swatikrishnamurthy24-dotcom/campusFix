// issueService.js
//
// Mock issue-reporting service for the Student Portal (Phase 4). Every
// function here returns a Promise and is shaped the way a real API client
// would be, so swapping this module for real `fetch` calls later shouldn't
// require touching any component — only this file.
//
// STATE NOTE: issues/notifications/votes live in a module-level array for
// the lifetime of the tab (mock "database"). This intentionally resets on a
// full page reload — there is no real backend yet, so nothing should be
// treated as durable. Only auth (src/context/AuthContext.jsx) persists to
// localStorage, and even that stores a session, not application data.

import { initialMockIssues } from "@/data/mockIssues"
import { initialMockNotifications } from "@/data/mockNotifications"

const MOCK_DELAY_MS = 350

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function generateIssueId(issues) {
  const nextNum = issues.length + 1001
  return `ISS-${nextNum}`
}

// In-memory mock "tables" — module-scoped so every caller shares the same
// data for the lifetime of the tab.
let issues = [...initialMockIssues]
let notifications = [...initialMockNotifications]
// Tracks one vote per (userId, issueId) so a student can't vote twice.
// Map<string "userId::issueId", "up" | "down">
const voteRecords = new Map()

/** All issues (used where the portal design calls for campus-wide visibility). */
export async function getIssues() {
  await delay()
  return [...issues]
}

/** Alias of getIssues() — matches the Admin Portal service spec (Phase 6 §5). */
export async function getAllIssues() {
  return getIssues()
}

export async function getIssueById(issueId) {
  await delay()
  const issue = issues.find((i) => i.id === issueId)
  if (!issue) {
    throw new Error(`Issue ${issueId} was not found.`)
  }
  return { ...issue }
}

/** Issues reported by a specific student (used by "My Issues"). */
export async function getStudentIssues(userId) {
  await delay()
  return issues.filter((i) => i.reportedBy === userId).map((i) => ({ ...i }))
}

/**
 * Creates a new issue. `reportedBy`/`reportedByName` must come from the
 * authenticated user — callers should never let this be hand-entered.
 */
export async function createIssue({ reportedBy, reportedByName, ...fields }) {
  await delay(500)

  if (!reportedBy) {
    throw new Error("createIssue requires an authenticated reporter.")
  }

  const now = new Date().toISOString()
  const newIssue = {
    id: generateIssueId(issues),
    title: fields.title,
    description: fields.description,
    category: fields.category,
    location: fields.location,
    building: fields.building || "",
    floor: fields.floor || "",
    room: fields.room || "",
    priority: fields.priority,
    status: "Pending",
    reportedBy,
    reportedByName,
    createdAt: now,
    updatedAt: now,
    upvotes: 0,
    downvotes: 0,
    image: fields.image || null, // object URL only — see ReportIssue.jsx
    comments: [],
  }

  issues = [newIssue, ...issues]
  return { ...newIssue }
}

export async function updateIssue(issueId, patch) {
  await delay()
  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue
    updated = { ...issue, ...patch, updatedAt: new Date().toISOString() }
    return updated
  })
  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { ...updated }
}

/**
 * Casts (or changes/removes) a vote on an issue for a given user.
 * voteType: "up" | "down".
 * - Voting the same direction again removes the vote (toggle off).
 * - Voting the other direction switches it.
 * A user can never hold more than one active vote on the same issue.
 */
export async function voteIssue(issueId, userId, voteType) {
  await delay(150)

  if (!userId) throw new Error("voteIssue requires an authenticated user.")
  if (!["up", "down"].includes(voteType)) throw new Error("voteType must be 'up' or 'down'.")

  const recordKey = `${userId}::${issueId}`
  const previousVote = voteRecords.get(recordKey)

  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue

    let { upvotes, downvotes } = issue

    if (previousVote === voteType) {
      // Toggling the same vote off.
      if (voteType === "up") upvotes -= 1
      else downvotes -= 1
      voteRecords.delete(recordKey)
    } else {
      // New vote, or switching from the opposite direction.
      if (previousVote === "up") upvotes -= 1
      if (previousVote === "down") downvotes -= 1
      if (voteType === "up") upvotes += 1
      else downvotes += 1
      voteRecords.set(recordKey, voteType)
    }

    updated = { ...issue, upvotes, downvotes }
    return updated
  })

  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { issue: { ...updated }, userVote: voteRecords.get(recordKey) ?? null }
}

/** Returns the current user's vote on an issue, if any: "up" | "down" | null. */
export function getUserVote(issueId, userId) {
  return voteRecords.get(`${userId}::${issueId}`) ?? null
}

// ---- Staff Portal (Phase 5) ------------------------------------------------
//
// Everything below reuses the same in-memory `issues` "table" and the same
// updateIssue()-style immutable-update pattern as the Student Portal above —
// no second issue model, per Phase 5 §4/§11.
//
// `activity` is a per-issue timeline distinct from `comments`: every status
// change, priority change, and comment appends an activity entry, but only
// comments also append to `comments` (so the Student Portal's existing
// "Comments & Activity" list, which reads `issue.comments`, keeps working
// unchanged).

function appendActivity(issue, entry) {
  const activity = issue.activity ?? []
  const newEntry = {
    id: `act-${issue.id}-${activity.length + 1}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }
  return { ...issue, activity: [...activity, newEntry] }
}

/** Issues assigned to a specific staff member (used by "Assigned Issues"). */
export async function getAssignedIssues(staffId) {
  await delay()
  return issues.filter((i) => i.assignedTo === staffId).map((i) => ({ ...i }))
}

/** The activity timeline for a single issue, oldest first. */
export async function getIssueActivity(issueId) {
  await delay(150)
  const issue = issues.find((i) => i.id === issueId)
  if (!issue) throw new Error(`Issue ${issueId} was not found.`)
  return [...(issue.activity ?? [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

/**
 * Updates an issue's status and records the change as an activity entry.
 * `actor` should be the authenticated staff user ({ name, role }) so the
 * timeline shows who made the change.
 */
export async function updateIssueStatus(issueId, status, actor) {
  await delay()
  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue
    const now = new Date().toISOString()
    let next = { ...issue, status, updatedAt: now }
    next = appendActivity(next, {
      type: "status",
      message: `Status changed from ${issue.status} to ${status}.`,
      user: actor?.name ?? "Staff",
      role: actor?.role ?? "staff",
    })
    updated = next
    return next
  })
  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { ...updated }
}

/**
 * Updates an issue's priority and records the change as an activity entry.
 * `actor` should be the authenticated staff user ({ name, role }).
 */
export async function updateIssuePriority(issueId, priority, actor) {
  await delay()
  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue
    const now = new Date().toISOString()
    let next = { ...issue, priority, updatedAt: now }
    next = appendActivity(next, {
      type: "priority",
      message: `Priority changed from ${issue.priority} to ${priority}.`,
      user: actor?.name ?? "Staff",
      role: actor?.role ?? "staff",
    })
    updated = next
    return next
  })
  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { ...updated }
}

/**
 * Adds a staff comment/update to an issue. Appends to both `comments`
 * (shared with the Student Portal's issue view) and `activity` (staff-only
 * timeline), and bumps `updatedAt`.
 */
export async function addIssueComment(issueId, { text, author, role }) {
  await delay(300)

  const trimmed = (text ?? "").trim()
  if (!trimmed) throw new Error("Comment cannot be empty.")

  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue
    const now = new Date().toISOString()
    const comment = { id: `c${issue.comments.length + 1}`, author, role, text: trimmed, createdAt: now }
    let next = { ...issue, comments: [...issue.comments, comment], updatedAt: now }
    next = appendActivity(next, {
      type: "comment",
      message: trimmed,
      user: author,
      role,
    })
    updated = next
    return next
  })
  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { ...updated }
}

// ---- Admin Portal (Phase 6) -------------------------------------------------
//
// Staff assignment. Reuses the same `issues` "table" and appendActivity()
// pattern as the Staff Portal functions above — no second issue model, per
// Phase 6 §5/§17.

/**
 * Assigns (or reassigns) an issue to a staff member and records the change
 * as an activity entry. `actor` should be the authenticated admin user
 * ({ name, role }).
 */
export async function assignIssue(issueId, staffId, staffName, actor) {
  await delay()
  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue
    const now = new Date().toISOString()
    const wasAssigned = Boolean(issue.assignedTo)
    let next = { ...issue, assignedTo: staffId, assignedToName: staffName, updatedAt: now }
    next = appendActivity(next, {
      type: "assigned",
      message: wasAssigned
        ? `Reassigned from ${issue.assignedToName} to ${staffName}.`
        : `Assigned to ${staffName}.`,
      user: actor?.name ?? "Admin",
      role: actor?.role ?? "admin",
    })
    updated = next
    return next
  })
  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { ...updated }
}

/** Removes any staff assignment from an issue. `actor` is the admin user. */
export async function unassignIssue(issueId, actor) {
  await delay()
  let updated = null
  issues = issues.map((issue) => {
    if (issue.id !== issueId) return issue
    const now = new Date().toISOString()
    let next = { ...issue, assignedTo: null, assignedToName: null, updatedAt: now }
    next = appendActivity(next, {
      type: "assigned",
      message: `Unassigned from ${issue.assignedToName ?? "previous staff"}.`,
      user: actor?.name ?? "Admin",
      role: actor?.role ?? "admin",
    })
    updated = next
    return next
  })
  if (!updated) throw new Error(`Issue ${issueId} was not found.`)
  return { ...updated }
}

// ---- Notifications -------------------------------------------------------

export async function getNotifications(userId) {
  await delay()
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((n) => ({ ...n }))
}

export async function markNotificationRead(notificationId) {
  await delay(120)
  notifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
}

export async function markAllNotificationsRead(userId) {
  await delay(120)
  notifications = notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n))
}
