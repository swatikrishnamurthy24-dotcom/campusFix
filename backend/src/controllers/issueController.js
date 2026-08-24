const Issue = require("../models/Issue")
const Comment = require("../models/Comment")
const Activity = require("../models/Activity")
const asyncHandler = require("../utils/asyncHandler")
const notify = require("../utils/notify")

// Loads an Issue by its human-friendly displayId (e.g. "ISS-1001"), which
// is how the frontend addresses issues everywhere. Throws a 404-shaped
// error if not found so callers can `await loadIssue(...)` directly.
async function loadIssueOr404(displayId) {
  const issue = await Issue.findOne({ displayId })
  if (!issue) {
    const err = new Error(`Issue ${displayId} was not found.`)
    err.statusCode = 404
    throw err
  }
  return issue
}

async function attachExtras(issue) {
  const [comments, activity] = await Promise.all([
    Comment.find({ issue: issue._id }).sort({ createdAt: 1 }),
    Activity.find({ issue: issue._id }).sort({ createdAt: 1 }),
  ])
  return {
    ...issue.toPublicJSON(),
    comments: comments.map((c) => c.toPublicJSON()),
    activity: activity.map((a) => a.toPublicJSON()),
  }
}

// GET /api/v1/issues — all issues (campus-wide visibility).
const getIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find().sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: issues.map((i) => i.toPublicJSON()) })
})

// GET /api/v1/issues/:id — single issue with comments + activity attached.
const getIssueById = asyncHandler(async (req, res) => {
  const issue = await loadIssueOr404(req.params.id)
  const payload = await attachExtras(issue)
  res.status(200).json({ success: true, data: payload })
})

// GET /api/v1/issues/mine — issues reported by the authenticated student.
const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ reportedBy: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: issues.map((i) => i.toPublicJSON()) })
})

// GET /api/v1/issues/assigned — issues assigned to the authenticated staff member.
const getAssignedIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ assignedTo: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: issues.map((i) => i.toPublicJSON()) })
})

// POST /api/v1/issues — create a new issue.
// `reportedBy`/`reportedByName` are taken from the authenticated user only
// — never trusted from the request body (Phase 7 spec §4/§7).
const createIssue = asyncHandler(async (req, res) => {
  const { title, description, category, location, building, floor, room, priority, image } = req.body

  if (!title || !description || !category || !location) {
    return res
      .status(400)
      .json({ success: false, message: "Title, description, category, and location are required." })
  }

  const displayId = await Issue.nextDisplayId()

  const issue = await Issue.create({
    displayId,
    title,
    description,
    category,
    location,
    building: building || "",
    floor: floor || "",
    room: room || "",
    priority: priority || "Medium",
    status: "Pending",
    reportedBy: req.user._id,
    reportedByName: req.user.name,
    image: image || null,
  })

  await Activity.create({
    issue: issue._id,
    type: "created",
    message: "Issue reported.",
    user: req.user.name,
    role: req.user.role,
  })

  res.status(201).json({ success: true, data: await attachExtras(issue) })
})

// PATCH /api/v1/issues/:id/status — staff/admin only (route-level authorize).
const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const allowed = ["Pending", "Acknowledged", "In Progress", "Resolved", "Rejected"]
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(", ")}` })
  }

  const issue = await loadIssueOr404(req.params.id)
  const previousStatus = issue.status

  issue.status = status
  await issue.save()

  await Activity.create({
    issue: issue._id,
    type: "status",
    message: `Status changed from ${previousStatus} to ${status}.`,
    user: req.user.name,
    role: req.user.role,
  })

  // Notify the student who reported it.
  await notify({
    userId: issue.reportedBy,
    type: "status",
    title: status === "Resolved" ? "Issue resolved" : `Issue ${status.toLowerCase()}`,
    message: `Your issue "${issue.title}" is now ${status}.`,
    issueId: issue.displayId,
  })

  res.status(200).json({ success: true, data: await attachExtras(issue) })
})

// PATCH /api/v1/issues/:id/priority — staff/admin only.
const updateIssuePriority = asyncHandler(async (req, res) => {
  const { priority } = req.body
  const allowed = ["Low", "Medium", "High", "Emergency"]
  if (!allowed.includes(priority)) {
    return res.status(400).json({ success: false, message: `priority must be one of: ${allowed.join(", ")}` })
  }

  const issue = await loadIssueOr404(req.params.id)
  const previousPriority = issue.priority

  issue.priority = priority
  await issue.save()

  await Activity.create({
    issue: issue._id,
    type: "priority",
    message: `Priority changed from ${previousPriority} to ${priority}.`,
    user: req.user.name,
    role: req.user.role,
  })

  res.status(200).json({ success: true, data: await attachExtras(issue) })
})

// PATCH /api/v1/issues/:id/assign — admin only.
const assignIssue = asyncHandler(async (req, res) => {
  const { staffId, staffName } = req.body
  if (!staffId || !staffName) {
    return res.status(400).json({ success: false, message: "staffId and staffName are required." })
  }

  const issue = await loadIssueOr404(req.params.id)
  const wasAssigned = Boolean(issue.assignedTo)
  const previousName = issue.assignedToName

  issue.assignedTo = staffId
  issue.assignedToName = staffName
  await issue.save()

  await Activity.create({
    issue: issue._id,
    type: "assigned",
    message: wasAssigned ? `Reassigned from ${previousName} to ${staffName}.` : `Assigned to ${staffName}.`,
    user: req.user.name,
    role: req.user.role,
  })

  await notify({
    userId: staffId,
    type: "assigned",
    title: "New issue assigned",
    message: `You have been assigned to "${issue.title}".`,
    issueId: issue.displayId,
  })

  res.status(200).json({ success: true, data: await attachExtras(issue) })
})

// PATCH /api/v1/issues/:id/unassign — admin only.
const unassignIssue = asyncHandler(async (req, res) => {
  const issue = await loadIssueOr404(req.params.id)
  const previousName = issue.assignedToName

  issue.assignedTo = null
  issue.assignedToName = null
  await issue.save()

  await Activity.create({
    issue: issue._id,
    type: "assigned",
    message: `Unassigned from ${previousName ?? "previous staff"}.`,
    user: req.user.name,
    role: req.user.role,
  })

  res.status(200).json({ success: true, data: await attachExtras(issue) })
})

module.exports = {
  loadIssueOr404,
  attachExtras,
  getIssues,
  getIssueById,
  getMyIssues,
  getAssignedIssues,
  createIssue,
  updateIssueStatus,
  updateIssuePriority,
  assignIssue,
  unassignIssue,
}
