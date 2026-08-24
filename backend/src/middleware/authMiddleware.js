const jwt = require("jsonwebtoken")
const User = require("../models/User")

// authMiddleware.js
//
// Verifies the JWT sent in `Authorization: Bearer <token>` and attaches the
// authenticated user document to req.user. This is the actual security
// boundary the Phase 1-6 frontend's ProtectedRoute explicitly said it was
// NOT (see AuthContext.jsx) — every protected route below re-checks here,
// server-side, regardless of what the client claims.

async function protect(req, res, next) {
  let token = null

  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. No token provided." })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized. User no longer exists." })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized. Invalid or expired token." })
  }
}

module.exports = { protect }
