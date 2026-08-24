const mongoose = require("mongoose")

// Notification.js
//
// Per-user notifications, matching the shape of
// src/data/mockNotifications.js / issueService.js's getNotifications() so
// the frontend Notifications pages (student/staff/admin) need no reshaping.

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["status", "vote", "comment", "assigned"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Stores the issue's human-friendly displayId (e.g. "ISS-1001"), not an
    // ObjectId ref — the frontend addresses issues by this string throughout.
    issueId: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ user: 1, createdAt: -1 })

notificationSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    userId: this.user.toString(),
    type: this.type,
    title: this.title,
    message: this.message,
    issueId: this.issueId,
    read: this.read,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model("Notification", notificationSchema)
