const jwt = require("jsonwebtoken")
const User = require("../models/User")
const asyncHandler = require("../utils/asyncHandler")

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}

// POST /api/v1/auth/register
// Public. Creates a new user. Role defaults to "student" unless the caller
// is already an authenticated admin (handled separately via userController
// for admin-created staff/admin accounts) — self-registration is
// intentionally locked to "student" to prevent privilege escalation.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, department } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required." })
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with that email already exists." })
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "student",
    studentId: studentId || null,
    department: department || null,
  })

  const token = signToken(user._id)
  res.status(201).json({ success: true, token, user: user.toPublicJSON() })
})

// POST /api/v1/auth/login
// Public. Verifies credentials and returns a JWT + public user object.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." })
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password")
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password. Please try again." })
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password. Please try again." })
  }

  const token = signToken(user._id)
  res.status(200).json({ success: true, token, user: user.toPublicJSON() })
})

// GET /api/v1/auth/me
// Protected. Returns the currently authenticated user — used on app load
// to restore a session from a stored token without re-entering credentials.
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toPublicJSON() })
})

// POST /api/v1/auth/logout
// Protected. JWTs are stateless, so there is nothing to invalidate
// server-side in this implementation — this endpoint exists for API
// symmetry / future token-blocklist support. The frontend clears its
// stored token regardless of this response.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out." })
})

module.exports = { register, login, getMe, logout }
