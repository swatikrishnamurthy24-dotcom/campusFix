const Notification = require("../models/Notification")
const asyncHandler = require("../utils/asyncHandler")

// GET /api/v1/notifications — the authenticated user's own notifications only.
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: notifications.map((n) => n.toPublicJSON()) })
})

// PATCH /api/v1/notifications/:id/read
const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id })
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found." })
  }
  notification.read = true
  await notification.save()
  res.status(200).json({ success: true, data: notification.toPublicJSON() })
})

// PATCH /api/v1/notifications/read/all
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } })
  res.status(200).json({ success: true, message: "All notifications marked as read." })
})

module.exports = { getNotifications, markNotificationRead, markAllNotificationsRead }
