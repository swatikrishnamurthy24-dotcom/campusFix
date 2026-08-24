const mongoose = require("mongoose")

// Activity.js
//
// Per-issue audit timeline — distinct from Comment.js. Every status change,
// priority change, assignment, and comment addition appends an entry here,
// matching the appendActivity() pattern in the Phase 5/6 frontend mock
// (src/services/issueService.js).

const activitySchema = new mongoose.Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    type: {
      type: String,
      enum: ["created", "status", "priority", "assigned", "comment"],
      required: true,
    },
    message: { type: String, required: true },
    user: { type: String, required: true }, // actor display name
    role: { type: String, enum: ["student", "staff", "admin"], required: true },
  },
  { timestamps: true }
)

activitySchema.index({ issue: 1, createdAt: 1 })

activitySchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    type: this.type,
    message: this.message,
    user: this.user,
    role: this.role,
    timestamp: this.createdAt,
  }
}

module.exports = mongoose.model("Activity", activitySchema)
