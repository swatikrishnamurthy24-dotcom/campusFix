const express = require("express")
const {
  getIssues,
  getIssueById,
  getMyIssues,
  getAssignedIssues,
  createIssue,
  updateIssueStatus,
  updateIssuePriority,
  assignIssue,
  unassignIssue,
} = require("../controllers/issueController")
const { voteOnIssue, getUserVote } = require("../controllers/voteController")
const { addComment, getComments } = require("../controllers/commentController")
const { getIssueActivity } = require("../controllers/activityController")
const { protect } = require("../middleware/authMiddleware")
const { authorize } = require("../middleware/authorizeMiddleware")

const router = express.Router()

// All issue routes require authentication.
router.use(protect)

// Fixed-path routes MUST be declared before "/:id" so they aren't swallowed
// by the dynamic param route.
router.get("/mine", authorize("student"), getMyIssues)
router.get("/assigned", authorize("staff"), getAssignedIssues)

router.get("/", getIssues)
router.post("/", authorize("student"), createIssue)
router.get("/:id", getIssueById)

router.patch("/:id/status", authorize("staff", "admin"), updateIssueStatus)
router.patch("/:id/priority", authorize("staff", "admin"), updateIssuePriority)
router.patch("/:id/assign", authorize("admin"), assignIssue)
router.patch("/:id/unassign", authorize("admin"), unassignIssue)

router.get("/:id/vote", getUserVote)
router.post("/:id/vote", authorize("student"), voteOnIssue)

router.get("/:id/comments", getComments)
router.post("/:id/comments", addComment)

router.get("/:id/activity", getIssueActivity)

module.exports = router
