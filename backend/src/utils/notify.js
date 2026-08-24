const Notification = require("../models/Notification")

// notify.js — small helper so controllers don't repeat Notification.create()
// boilerplate. Never throws into the request/response cycle on its own;
// callers await it directly since notification creation is not optional
// business logic (Phase 7 spec §9), but errors still propagate to
// asyncHandler like any other awaited call.
async function notify({ userId, type, title, message, issueId }) {
  return Notification.create({ user: userId, type, title, message, issueId: issueId || null })
}

module.exports = notify
