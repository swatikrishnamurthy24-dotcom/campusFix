// seedDatabase.js
//
// Populates MongoDB with development-only demo data: the same three demo
// accounts the Phase 1-6 frontend mock shipped with (src/services/
// authService.js DEMO_ACCOUNTS), plus a couple of sample issues so the UI
// isn't empty on first run. Run with: npm run seed
//
// DEVELOPMENT ONLY. Never run against a production database — this wipes
// existing Users/Issues/Votes/Comments/Activities/Notifications first.

require("dotenv").config()
const mongoose = require("mongoose")
const connectDB = require("../config/db")
const User = require("../models/User")
const Issue = require("../models/Issue")
const Vote = require("../models/Vote")
const Comment = require("../models/Comment")
const Activity = require("../models/Activity")
const Notification = require("../models/Notification")

async function seed() {
  await connectDB()

  console.log("Clearing existing data (development seed — do NOT run this against production)...")
  await Promise.all([
    User.deleteMany({}),
    Issue.deleteMany({}),
    Vote.deleteMany({}),
    Comment.deleteMany({}),
    Activity.deleteMany({}),
    Notification.deleteMany({}),
  ])

  console.log("Creating demo users (DEVELOPMENT ONLY — passwords are hashed, but these are not real secrets)...")
  const student = await User.create({
    name: "Swati R.",
    email: "student@campusfix.demo",
    password: "student123",
    role: "student",
    studentId: "STU-3001",
    department: "CSE",
  })

  const staff = await User.create({
    name: "Arjun K.",
    email: "staff@campusfix.demo",
    password: "staff123",
    role: "staff",
    staffId: "STF-2041",
    department: "Electrical",
    specialization: "Electrical wiring & fixtures",
  })

  const admin = await User.create({
    name: "Priya M.",
    email: "admin@campusfix.demo",
    password: "admin123",
    role: "admin",
  })

  console.log("Creating sample issues...")
  const issue1 = await Issue.create({
    displayId: "ISS-1001",
    title: "Broken fan in Classroom 204",
    description:
      "The ceiling fan in Classroom 204 has stopped working completely. It's getting very uncomfortable during afternoon classes.",
    category: "Electrical",
    location: "Main Block",
    building: "Main Block",
    floor: "2nd Floor",
    room: "204",
    priority: "High",
    status: "In Progress",
    reportedBy: student._id,
    reportedByName: student.name,
    assignedTo: staff._id,
    assignedToName: staff.name,
    upvotes: 3,
    downvotes: 0,
  })

  const issue2 = await Issue.create({
    displayId: "ISS-1002",
    title: "Wi-Fi not working in Library",
    description: "The library Wi-Fi has been down since this morning. Several students are affected.",
    category: "Internet / Network",
    location: "Library Block",
    building: "Library Block",
    floor: "1st Floor",
    room: "",
    priority: "Medium",
    status: "Pending",
    reportedBy: student._id,
    reportedByName: student.name,
    upvotes: 5,
    downvotes: 0,
  })

  await Activity.create([
    { issue: issue1._id, type: "created", message: "Issue reported.", user: student.name, role: "student" },
    {
      issue: issue1._id,
      type: "assigned",
      message: `Assigned to ${staff.name}.`,
      user: admin.name,
      role: "admin",
    },
    {
      issue: issue1._id,
      type: "status",
      message: "Status changed from Acknowledged to In Progress.",
      user: staff.name,
      role: "staff",
    },
    { issue: issue2._id, type: "created", message: "Issue reported.", user: student.name, role: "student" },
  ])

  await Comment.create({
    issue: issue1._id,
    author: staff._id,
    authorName: staff.name,
    role: "staff",
    text: "Replacement part ordered, should be fixed by tomorrow.",
  })

  await Notification.create([
    {
      user: student._id,
      type: "status",
      title: "Issue in progress",
      message: `Your issue "${issue1.title}" is now In Progress.`,
      issueId: issue1.displayId,
      read: false,
    },
    {
      user: staff._id,
      type: "assigned",
      title: "New issue assigned",
      message: `You have been assigned to "${issue1.title}".`,
      issueId: issue1.displayId,
      read: true,
    },
  ])

  console.log("\nSeed complete. DEVELOPMENT ONLY demo credentials:")
  console.log("  student@campusfix.demo / student123")
  console.log("  staff@campusfix.demo   / staff123")
  console.log("  admin@campusfix.demo   / admin123")
  console.log("\nDo not use these accounts or credentials in any production environment.")

  await mongoose.connection.close()
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
