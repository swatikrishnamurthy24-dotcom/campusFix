const Comment = require("../models/Comment")
const Activity = require("../models/Activity")
const asyncHandler = require("../utils/asyncHandler")
const notify = require("../utils/notify")
const { loadIssueOr404, attachExtras } = require("./issueController")

// POST /api/v1/issues/:id/comments
// The comment's author/role always come from the authenticated user
// (req.user) — never from the request body (Phase 7 spec §7: "Do not
// trust arbitrary user IDs from frontend").
const addComment = asyncHandler(async (req, res) => {
  const text = (req.body.text ?? "").trim()
  if (!text) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty." })
  }

  const issue = await loadIssueOr404(req.params.id)

  await Comment.create({
    issue: issue._id,
    author: req.user._id,
    authorName: req.user.name,
    role: req.user.role,
    text,
  })

  await Activity.create({
    issue: issue._id,
    type: "comment",
    message: text,
    user: req.user.name,
    role: req.user.role,
  })

  issue.updatedAt = new Date()
  await issue.save()

  // Notify the student who reported it, unless they're the one commenting.
  if (issue.reportedBy.toString() !== req.user._id.toString()) {
    await notify({
      userId: issue.reportedBy,
      type: "comment",
      title: `${req.user.name} commented`,
      message: `${req.user.name} commented on "${issue.title}".`,
      issueId: issue.displayId,
    })
  }

  res.status(201).json({ success: true, data: await attachExtras(issue) })
})

// GET /api/v1/issues/:id/comments
const getComments = asyncHandler(async (req, res) => {
  const issue = await loadIssueOr404(req.params.id)
  const comments = await Comment.find({ issue: issue._id }).sort({ createdAt: 1 })
  res.status(200).json({ success: true, data: comments.map((c) => c.toPublicJSON()) })
})

module.exports = { addComment, getComments }
