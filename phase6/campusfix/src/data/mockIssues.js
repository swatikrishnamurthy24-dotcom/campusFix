// mockIssues.js
//
// Seed data + shared constants for the Student Portal issue-reporting
// screens (Phase 4). This is frontend-only mock data — see
// src/services/issueService.js for the abstraction that reads/writes it.

export const ISSUE_CATEGORIES = [
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

export const ISSUE_PRIORITIES = ["Low", "Medium", "High", "Emergency"]

// Ordered lifecycle used for the status timeline in Issue Details.
// "Rejected" is a terminal state outside the normal happy-path sequence.
export const ISSUE_STATUSES = ["Pending", "Acknowledged", "In Progress", "Resolved", "Rejected"]

export const STATUS_BADGE_VARIANT = {
  Pending: "info",
  Acknowledged: "accent",
  "In Progress": "warning",
  Resolved: "success",
  Rejected: "danger",
}

export const PRIORITY_BADGE_VARIANT = {
  Low: "muted",
  Medium: "warning",
  High: "accent",
  Emergency: "danger",
}

// Demo reporter IDs match the mock accounts in src/services/authService.js
// so "My Issues" has something to filter against out of the box.
const DEMO_STUDENT_ID = "u-student-01"

// Demo staff IDs match src/data/mockStaff.js (staff directory). Only
// u-staff-01 has a real login (src/services/authService.js), the others
// exist purely so "assignedTo" has realistic variety across departments —
// see Phase 5 §12.
const DEMO_STAFF_ID = "u-staff-01"

export const initialMockIssues = [
  {
    id: "ISS-1001",
    title: "Broken fan in Classroom 204",
    description:
      "The ceiling fan in Classroom 204 has stopped working completely. It's getting very uncomfortable during afternoon classes.",
    category: "Electrical",
    location: "Main Block",
    building: "Main Block",
    floor: "2nd Floor",
    room: "Classroom 204",
    priority: "High",
    status: "In Progress",
    reportedBy: DEMO_STUDENT_ID,
    reportedByName: "Swati R.",
    assignedTo: DEMO_STAFF_ID,
    assignedToName: "Arjun K.",
    createdAt: "2026-08-10T09:15:00.000Z",
    updatedAt: "2026-08-14T11:00:00.000Z",
    upvotes: 12,
    downvotes: 1,
    image: null,
    comments: [
      { id: "c1", author: "Facilities Team", role: "staff", text: "Assigned to electrician.", createdAt: "2026-08-11T10:00:00.000Z" },
      { id: "c2", author: "Facilities Team", role: "staff", text: "Replacement part ordered, fitting scheduled this week.", createdAt: "2026-08-14T11:00:00.000Z" },
    ],
    activity: [
      { id: "act-1001-1", type: "created", message: "Issue reported.", user: "Swati R.", role: "student", timestamp: "2026-08-10T09:15:00.000Z" },
      { id: "act-1001-2", type: "assigned", message: "Assigned to Arjun K. (Electrical).", user: "System", role: "system", timestamp: "2026-08-10T10:30:00.000Z" },
      { id: "act-1001-3", type: "status", message: "Status changed from Pending to Acknowledged.", user: "Arjun K.", role: "staff", timestamp: "2026-08-11T09:45:00.000Z" },
      { id: "act-1001-4", type: "comment", message: "Assigned to electrician.", user: "Arjun K.", role: "staff", timestamp: "2026-08-11T10:00:00.000Z" },
      { id: "act-1001-5", type: "status", message: "Status changed from Acknowledged to In Progress.", user: "Arjun K.", role: "staff", timestamp: "2026-08-13T15:00:00.000Z" },
      { id: "act-1001-6", type: "comment", message: "Replacement part ordered, fitting scheduled this week.", user: "Arjun K.", role: "staff", timestamp: "2026-08-14T11:00:00.000Z" },
    ],
  },
  {
    id: "ISS-1002",
    title: "Water leakage in ground floor washroom",
    description:
      "There is continuous water leakage near the sink area in the ground floor washroom, Main Block. Floor stays wet and slippery.",
    category: "Washroom",
    location: "Main Block",
    building: "Main Block",
    floor: "Ground Floor",
    room: "Washroom - Near Entrance",
    priority: "Emergency",
    status: "Acknowledged",
    reportedBy: "u-student-02",
    reportedByName: "Rahul N.",
    assignedTo: DEMO_STAFF_ID,
    assignedToName: "Arjun K.",
    createdAt: "2026-08-15T08:30:00.000Z",
    updatedAt: "2026-08-15T14:20:00.000Z",
    upvotes: 27,
    downvotes: 0,
    image: null,
    comments: [
      { id: "c1", author: "Admin", role: "admin", text: "Escalated to plumbing team as urgent.", createdAt: "2026-08-15T14:20:00.000Z" },
    ],
    activity: [
      { id: "act-1002-1", type: "created", message: "Issue reported.", user: "Rahul N.", role: "student", timestamp: "2026-08-15T08:30:00.000Z" },
      { id: "act-1002-2", type: "priority", message: "Priority set to Emergency.", user: "Admin", role: "admin", timestamp: "2026-08-15T08:40:00.000Z" },
      { id: "act-1002-3", type: "assigned", message: "Assigned to Arjun K. (Electrical) for urgent triage.", user: "Admin", role: "admin", timestamp: "2026-08-15T08:45:00.000Z" },
      { id: "act-1002-4", type: "status", message: "Status changed from Pending to Acknowledged.", user: "Arjun K.", role: "staff", timestamp: "2026-08-15T14:15:00.000Z" },
      { id: "act-1002-5", type: "comment", message: "Escalated to plumbing team as urgent.", user: "Admin", role: "admin", timestamp: "2026-08-15T14:20:00.000Z" },
    ],
  },
  {
    id: "ISS-1003",
    title: "Projector not displaying in Lab 2",
    description: "The projector in CSE Lab 2 turns on but shows no display output. Tried two different laptops, same issue.",
    category: "Internet / Network",
    location: "CSE Block",
    building: "CSE Block",
    floor: "1st Floor",
    room: "Lab 2",
    priority: "Medium",
    status: "Pending",
    reportedBy: DEMO_STUDENT_ID,
    reportedByName: "Swati R.",
    assignedTo: DEMO_STAFF_ID,
    assignedToName: "Arjun K.",
    createdAt: "2026-08-18T13:45:00.000Z",
    updatedAt: "2026-08-18T13:45:00.000Z",
    upvotes: 5,
    downvotes: 0,
    image: null,
    comments: [],
    activity: [
      { id: "act-1003-1", type: "created", message: "Issue reported.", user: "Swati R.", role: "student", timestamp: "2026-08-18T13:45:00.000Z" },
      { id: "act-1003-2", type: "assigned", message: "Assigned to Arjun K. (Electrical).", user: "System", role: "system", timestamp: "2026-08-18T14:00:00.000Z" },
    ],
  },
  {
    id: "ISS-1004",
    title: "Wi-Fi not working in Library reading hall",
    description: "Wi-Fi has been disconnecting every few minutes in the Library reading hall since yesterday.",
    category: "Internet / Network",
    location: "Library",
    building: "Library",
    floor: "1st Floor",
    room: "Reading Hall",
    priority: "Medium",
    status: "Resolved",
    reportedBy: "u-student-03",
    reportedByName: "Ananya S.",
    assignedTo: DEMO_STAFF_ID,
    assignedToName: "Arjun K.",
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-07T16:30:00.000Z",
    upvotes: 18,
    downvotes: 2,
    image: null,
    comments: [
      { id: "c1", author: "IT Support", role: "staff", text: "Access point rebooted, monitoring for stability.", createdAt: "2026-08-06T09:00:00.000Z" },
      { id: "c2", author: "IT Support", role: "staff", text: "Confirmed stable for 24 hours, marking resolved.", createdAt: "2026-08-07T16:30:00.000Z" },
    ],
    activity: [
      { id: "act-1004-1", type: "created", message: "Issue reported.", user: "Ananya S.", role: "student", timestamp: "2026-08-05T10:00:00.000Z" },
      { id: "act-1004-2", type: "assigned", message: "Assigned to Arjun K. (Electrical).", user: "System", role: "system", timestamp: "2026-08-05T10:30:00.000Z" },
      { id: "act-1004-3", type: "status", message: "Status changed from Pending to In Progress.", user: "Arjun K.", role: "staff", timestamp: "2026-08-06T09:00:00.000Z" },
      { id: "act-1004-4", type: "comment", message: "Access point rebooted, monitoring for stability.", user: "Arjun K.", role: "staff", timestamp: "2026-08-06T09:00:00.000Z" },
      { id: "act-1004-5", type: "status", message: "Status changed from In Progress to Resolved.", user: "Arjun K.", role: "staff", timestamp: "2026-08-07T16:30:00.000Z" },
      { id: "act-1004-6", type: "comment", message: "Confirmed stable for 24 hours, marking resolved.", user: "Arjun K.", role: "staff", timestamp: "2026-08-07T16:30:00.000Z" },
    ],
  },
  {
    id: "ISS-1005",
    title: "Broken desk in Classroom 108",
    description: "One of the student desks in Classroom 108 has a broken leg and wobbles dangerously.",
    category: "Furniture",
    location: "Main Block",
    building: "Main Block",
    floor: "1st Floor",
    room: "Classroom 108",
    priority: "Low",
    status: "Rejected",
    reportedBy: DEMO_STUDENT_ID,
    reportedByName: "Swati R.",
    assignedTo: "u-staff-02",
    assignedToName: "Divya S.",
    createdAt: "2026-07-28T11:20:00.000Z",
    updatedAt: "2026-07-30T09:10:00.000Z",
    upvotes: 3,
    downvotes: 4,
    image: null,
    comments: [
      { id: "c1", author: "Facilities Team", role: "staff", text: "Could not locate the reported desk during inspection — please re-report with a photo if it recurs.", createdAt: "2026-07-30T09:10:00.000Z" },
    ],
    activity: [
      { id: "act-1005-1", type: "created", message: "Issue reported.", user: "Swati R.", role: "student", timestamp: "2026-07-28T11:20:00.000Z" },
      { id: "act-1005-2", type: "assigned", message: "Assigned to Divya S. (Civil / Maintenance).", user: "System", role: "system", timestamp: "2026-07-28T12:00:00.000Z" },
      { id: "act-1005-3", type: "status", message: "Status changed from Pending to Rejected.", user: "Divya S.", role: "staff", timestamp: "2026-07-30T09:10:00.000Z" },
      { id: "act-1005-4", type: "comment", message: "Could not locate the reported desk during inspection — please re-report with a photo if it recurs.", user: "Divya S.", role: "staff", timestamp: "2026-07-30T09:10:00.000Z" },
    ],
  },
  {
    id: "ISS-1006",
    title: "CCTV camera offline near Hostel Block entrance",
    description: "The CCTV camera near the Hostel Block main entrance appears to be offline (no blinking light) for the past two days.",
    category: "Security",
    location: "Hostel",
    building: "Hostel Block",
    floor: "Ground Floor",
    room: "Main Entrance",
    priority: "High",
    status: "Acknowledged",
    reportedBy: "u-student-04",
    reportedByName: "Karthik V.",
    assignedTo: "u-staff-03",
    assignedToName: "Farhan I.",
    createdAt: "2026-08-19T18:00:00.000Z",
    updatedAt: "2026-08-20T08:15:00.000Z",
    upvotes: 9,
    downvotes: 0,
    image: null,
    comments: [
      { id: "c1", author: "Security Office", role: "staff", text: "Technician notified, visiting tomorrow morning.", createdAt: "2026-08-20T08:15:00.000Z" },
    ],
    activity: [
      { id: "act-1006-1", type: "created", message: "Issue reported.", user: "Karthik V.", role: "student", timestamp: "2026-08-19T18:00:00.000Z" },
      { id: "act-1006-2", type: "assigned", message: "Assigned to Farhan I. (Security).", user: "System", role: "system", timestamp: "2026-08-19T18:30:00.000Z" },
      { id: "act-1006-3", type: "status", message: "Status changed from Pending to Acknowledged.", user: "Farhan I.", role: "staff", timestamp: "2026-08-20T08:15:00.000Z" },
      { id: "act-1006-4", type: "comment", message: "Technician notified, visiting tomorrow morning.", user: "Farhan I.", role: "staff", timestamp: "2026-08-20T08:15:00.000Z" },
    ],
  },
]
