const Vote = require("../models/Vote")
const asyncHandler = require("../utils/asyncHandler")
const notify = require("../utils/notify")
const { loadIssueOr404 } = require("./issueController")

// POST /api/v1/issues/:id/vote
// Body: { voteType: "up" | "down" }
// - Voting the same direction again removes the vote (toggle off).
// - Voting the other direction switches it.
// A Vote document with a unique (issue, user) index is the real,
// server-side guarantee against duplicate votes — see models/Vote.js.
const voteOnIssue = asyncHandler(async (req, res) => {
  const { voteType } = req.body
  if (!["up", "down"].includes(voteType)) {
    return res.status(400).json({ success: false, message: "voteType must be 'up' or 'down'." })
  }

  const issue = await loadIssueOr404(req.params.id)
  const existing = await Vote.findOne({ issue: issue._id, user: req.user._id })

  let userVote = null

  if (!existing) {
    // New vote.
    await Vote.create({ issue: issue._id, user: req.user._id, voteType })
    if (voteType === "up") issue.upvotes += 1
    else issue.downvotes += 1
    userVote = voteType

    if (voteType === "up" && issue.reportedBy.toString() !== req.user._id.toString()) {
      await notify({
        userId: issue.reportedBy,
        type: "vote",
        title: "New upvote",
        message: `Your issue "${issue.title}" received a new upvote.`,
        issueId: issue.displayId,
      })
    }
  } else if (existing.voteType === voteType) {
    // Toggle off.
    await existing.deleteOne()
    if (voteType === "up") issue.upvotes = Math.max(0, issue.upvotes - 1)
    else issue.downvotes = Math.max(0, issue.downvotes - 1)
    userVote = null
  } else {
    // Switch direction.
    if (existing.voteType === "up") issue.upvotes = Math.max(0, issue.upvotes - 1)
    if (existing.voteType === "down") issue.downvotes = Math.max(0, issue.downvotes - 1)
    if (voteType === "up") issue.upvotes += 1
    else issue.downvotes += 1
    existing.voteType = voteType
    await existing.save()
    userVote = voteType
  }

  await issue.save()

  res.status(200).json({ success: true, data: { issue: issue.toPublicJSON(), userVote } })
})

// GET /api/v1/issues/:id/vote — the authenticated user's current vote on an issue.
const getUserVote = asyncHandler(async (req, res) => {
  const issue = await loadIssueOr404(req.params.id)
  const existing = await Vote.findOne({ issue: issue._id, user: req.user._id })
  res.status(200).json({ success: true, data: { userVote: existing ? existing.voteType : null } })
})

module.exports = { voteOnIssue, getUserVote }
