const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// User.js
//
// Single collection for all three CampusFix roles (student/staff/admin).
// Role-specific fields (studentId/department, staffId/specialization) are
// optional on the shared schema rather than split into separate
// collections, matching how the Phase 6 frontend already treats users as
// one identity system with a `role` field (see mockStudents.js/mockStaff.js).

const ROLES = ["student", "staff", "admin"]

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 6,
      select: false, // never returned by default queries
    },
    role: {
      type: String,
      enum: ROLES,
      default: "student",
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },

    // Student-specific (optional; matches src/data/mockStudents.js)
    studentId: { type: String, default: null },
    department: { type: String, default: null }, // also used for staff department

    // Staff-specific (optional; matches src/data/mockStaff.js)
    staffId: { type: String, default: null },
    specialization: { type: String, default: null },

    // Shared status field (Active / Inactive / On Leave), mirrors mock data.
    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave"],
      default: "Active",
    },
  },
  { timestamps: true }
)

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Shape returned to the frontend — never includes the password hash.
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    studentId: this.studentId,
    department: this.department,
    staffId: this.staffId,
    specialization: this.specialization,
    status: this.status,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model("User", userSchema)
module.exports.ROLES = ROLES
