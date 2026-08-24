const User = require("../models/User")
const asyncHandler = require("../utils/asyncHandler")

// GET /api/v1/users — admin only. Optional ?role=student|staff|admin filter.
// Powers the Admin Portal's Students/Staff directories (adminService.js).
const getUsers = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.role) filter.role = req.query.role
  if (req.query.department) filter.department = req.query.department

  const users = await User.find(filter).sort({ createdAt: -1 })
  res.status(200).json({ success: true, data: users.map((u) => u.toPublicJSON()) })
})

// GET /api/v1/users/:id — admin only.
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." })
  }
  res.status(200).json({ success: true, data: user.toPublicJSON() })
})

// POST /api/v1/users — admin only. Creates a staff or admin account
// (self-registration via /auth/register is locked to "student").
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, specialization, staffId } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "name, email, password, and role are required." })
  }
  if (!["student", "staff", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "role must be student, staff, or admin." })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return res.status(409).json({ success: false, message: "An account with that email already exists." })
  }

  const user = await User.create({ name, email, password, role, department, specialization, staffId })
  res.status(201).json({ success: true, data: user.toPublicJSON() })
})

// PATCH /api/v1/users/me — any authenticated user updates their own profile.
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "avatar"]
  const updates = {}
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field]
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
  res.status(200).json({ success: true, data: user.toPublicJSON() })
})

// PATCH /api/v1/users/:id — admin only. Update role/status/department etc.
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "role", "status", "department", "specialization", "staffId", "studentId"]
  const updates = {}
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field]
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." })
  }
  res.status(200).json({ success: true, data: user.toPublicJSON() })
})

module.exports = { getUsers, getUserById, createUser, updateMe, updateUser }
