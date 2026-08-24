const mongoose = require("mongoose")

// Issue.js
//
// Core issue-tracking document. Mirrors the shape the Phase 1-6 frontend
// already renders (src/data/mockIssues.js / src/services/issueService.js),
// so the API layer can map documents to that shape with minimal transform.
// `comments` and `activity` are stored in their own collections (Comment.js,
// Activity.js) and attached by the controller when fetching a single issue,
// keeping this document lean for list views.

const CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Furniture",
  "Internet / Network",
  "Classroom",
  "Laboratory",
  "Washroom",
  "Security",
  "Other",
]

const PRIORITIES = ["Low", "Medium", "High", "Emergency"]
const STATUSES = ["Pending", "Acknowledged", "In Progress", "Resolved", "Rejected"]

const issueSchema = new mongoose.Schema(
  {
    // Human-friendly display id, e.g. "ISS-1001" — kept alongside Mongo's
    // _id because the existing frontend components key/display issues by
    // this string (see mockIssues.js).
    displayId: {
      type: String,
      unique: true,
    },
    title: { type: String, required: [true, "Title is required."], trim: true },
    description: { type: String, required: [true, "Description is required."], trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    location: { type: String, required: true },
    building: { type: String, default: "" },
    floor: { type: String, default: "" },
    room: { type: String, default: "" },
    priority: { type: String, enum: PRIORITIES, default: "Medium" },
    status: { type: String, enum: STATUSES, default: "Pending" },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedByName: { type: String, required: true },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedToName: { type: String, default: null },

    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },

    image: { type: String, default: null },
  },
  { timestamps: true }
)

issueSchema.index({ reportedBy: 1 })
issueSchema.index({ assignedTo: 1 })
issueSchema.index({ status: 1 })

// Assigns the next ISS-#### display id. Simple/sequential — fine for a
// single-instance dev/demo backend; a high-concurrency production system
// would use an atomic counter collection instead.
issueSchema.statics.nextDisplayId = async function nextDisplayId() {
  const count = await this.countDocuments()
  return `ISS-${1001 + count}`
}

issueSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this.displayId,
    _id: this._id.toString(),
    title: this.title,
    description: this.description,
    category: this.category,
    location: this.location,
    building: this.building,
    floor: this.floor,
    room: this.room,
    priority: this.priority,
    status: this.status,
    reportedBy: this.reportedBy?._id ? this.reportedBy._id.toString() : this.reportedBy?.toString(),
    reportedByName: this.reportedByName,
    assignedTo: this.assignedTo?._id ? this.assignedTo._id.toString() : this.assignedTo?.toString() ?? null,
    assignedToName: this.assignedToName,
    upvotes: this.upvotes,
    downvotes: this.downvotes,
    image: this.image,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  }
}

module.exports = mongoose.model("Issue", issueSchema)
module.exports.CATEGORIES = CATEGORIES
module.exports.PRIORITIES = PRIORITIES
module.exports.STATUSES = STATUSES
