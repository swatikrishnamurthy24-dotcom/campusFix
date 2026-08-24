// issueService.js
//
// Phase 7: real API-backed issue service, replacing the Phase 1-6
// in-memory mock ("STATE NOTE" below no longer applies — issues now live
// in MongoDB via the backend). Every exported function keeps the exact
// name and argument shape the mock had, so no component (Student/Staff/
// Admin portals) needed to change — only this file's internals.
//
// AUTH NOTE: `reportedBy`/`author`/`actor` arguments are still accepted
// for call-site compatibility with existing components, but the backend
// ignores/overrides them with the authenticated user from the JWT — see
// backend/src/controllers/issueController.js and commentController.js.
// This matches Phase 7 spec §7: "Do not trust arbitrary user IDs from
// frontend."

import { api } from "@/services/api"

/** All issues (campus-wide visibility). */
export async function getIssues() {
  const data = await api.get("/issues")
  return data.data
}

/** Alias of getIssues() — matches the Admin Portal service spec (Phase 6 §5). */
export async function getAllIssues() {
  return getIssues()
}

export async function getIssueById(issueId) {
  const data = await api.get(`/issues/${issueId}`)
  return data.data
}

/**
 * Issues reported by a specific student (used by "My Issues"). The `userId`
 * argument is kept for call-site compatibility but the backend always
 * scopes this to the authenticated user via GET /issues/mine.
 */
// eslint-disable-next-line no-unused-vars
export async function getStudentIssues(userId) {
  const data = await api.get("/issues/mine")
  return data.data
}

/**
 * Creates a new issue. `reportedBy`/`reportedByName` are accepted for
 * call-site compatibility but ignored — the backend always uses the
 * authenticated user as the reporter.
 */
// eslint-disable-next-line no-unused-vars
export async function createIssue({ reportedBy, reportedByName, ...fields }) {
  const data = await api.post("/issues", fields)
  return data.data
}

/**
 * Casts (or changes/removes) a vote on an issue for the authenticated
 * user. voteType: "up" | "down". The `userId` argument is kept for
 * call-site compatibility — the backend always uses the authenticated
 * user, never a client-supplied id.
 */
// eslint-disable-next-line no-unused-vars
export async function voteIssue(issueId, userId, voteType) {
  const data = await api.post(`/issues/${issueId}/vote`, { voteType })
  return data.data // { issue, userVote }
}

/** Returns the current (authenticated) user's vote on an issue: "up" | "down" | null. */
// eslint-disable-next-line no-unused-vars
export async function getUserVote(issueId, userId) {
  const data = await api.get(`/issues/${issueId}/vote`)
  return data.data.userVote
}

// ---- Staff Portal -----------------------------------------------------

/**
 * Issues assigned to the authenticated staff member. `staffId` is kept for
 * call-site compatibility — the backend always scopes this to the
 * authenticated user via GET /issues/assigned.
 */
// eslint-disable-next-line no-unused-vars
export async function getAssignedIssues(staffId) {
  const data = await api.get("/issues/assigned")
  return data.data
}

/** The activity timeline for a single issue, oldest first. */
export async function getIssueActivity(issueId) {
  const data = await api.get(`/issues/${issueId}/activity`)
  return data.data
}

/**
 * Updates an issue's status. `actor` is kept for call-site compatibility —
 * the backend always attributes the change to the authenticated user.
 */
// eslint-disable-next-line no-unused-vars
export async function updateIssueStatus(issueId, status, actor) {
  const data = await api.patch(`/issues/${issueId}/status`, { status })
  return data.data
}

/**
 * Updates an issue's priority. `actor` is kept for call-site compatibility
 * — the backend always attributes the change to the authenticated user.
 */
// eslint-disable-next-line no-unused-vars
export async function updateIssuePriority(issueId, priority, actor) {
  const data = await api.patch(`/issues/${issueId}/priority`, { priority })
  return data.data
}

/**
 * Adds a comment to an issue. `author`/`role` are kept for call-site
 * compatibility but ignored — the backend always uses the authenticated
 * user, never client-supplied identity fields (Phase 7 spec §7).
 */
// eslint-disable-next-line no-unused-vars
export async function addIssueComment(issueId, { text, author, role }) {
  const data = await api.post(`/issues/${issueId}/comments`, { text })
  return data.data
}

// ---- Admin Portal -------------------------------------------------------

/**
 * Assigns (or reassigns) an issue to a staff member. `actor` is kept for
 * call-site compatibility — the backend always attributes the change to
 * the authenticated admin.
 */
// eslint-disable-next-line no-unused-vars
export async function assignIssue(issueId, staffId, staffName, actor) {
  const data = await api.patch(`/issues/${issueId}/assign`, { staffId, staffName })
  return data.data
}

/** Removes any staff assignment from an issue. `actor` is kept for call-site compatibility. */
// eslint-disable-next-line no-unused-vars
export async function unassignIssue(issueId, actor) {
  const data = await api.patch(`/issues/${issueId}/unassign`)
  return data.data
}

// ---- Notifications --------------------------------------------------------

/**
 * The authenticated user's notifications. `userId` is kept for call-site
 * compatibility — the backend always scopes this to the authenticated user.
 */
// eslint-disable-next-line no-unused-vars
export async function getNotifications(userId) {
  const data = await api.get("/notifications")
  return data.data
}

export async function markNotificationRead(notificationId) {
  await api.patch(`/notifications/${notificationId}/read`)
}

/**
 * Marks all of the authenticated user's notifications as read. `userId` is
 * kept for call-site compatibility — the backend always scopes this to the
 * authenticated user.
 */
// eslint-disable-next-line no-unused-vars
export async function markAllNotificationsRead(userId) {
  await api.patch("/notifications/read/all")
}
