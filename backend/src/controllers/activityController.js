const Activity = require("../models/Activity")
const asyncHandler = require("../utils/asyncHandler")
const { loadIssueOr404 } = require("./issueController")

// GET /api/v1/issues/:id/activity — oldest first, matching the frontend's
// timeline rendering (ActivityTimeline.jsx).
const getIssueActivity = asyncHandler(async (req, res) => {
  const issue = await loadIssueOr404(req.params.id)
  const activity = await Activity.find({ issue: issue._id }).sort({ createdAt: 1 })
  res.status(200).json({ success: true, data: activity.map((a) => a.toPublicJSON()) })
})

module.exports = { getIssueActivity }
