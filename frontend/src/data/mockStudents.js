// mockStudents.js — Student directory for the Admin Portal (Phase 6 §6).
// Frontend-only mock data.
//
// IDs match `reportedBy` on mock issues (src/data/mockIssues.js) so issue
// history / counts can be cross-referenced without inventing a second
// student identity system.

export const STUDENT_DEPARTMENTS = [
  "CSE",
  "ECE",
  "Mechanical",
  "Civil",
  "MBA",
]

export const STUDENT_STATUSES = ["Active", "Inactive"]

export const initialMockStudents = [
  {
    id: "u-student-01",
    studentId: "STU-3001",
    name: "Swati R.",
    email: "student@campusfix.demo",
    department: "CSE",
    status: "Active",
  },
  {
    id: "u-student-02",
    studentId: "STU-3014",
    name: "Rahul N.",
    email: "rahul.n@campusfix.demo",
    department: "ECE",
    status: "Active",
  },
  {
    id: "u-student-03",
    studentId: "STU-3027",
    name: "Ananya S.",
    email: "ananya.s@campusfix.demo",
    department: "MBA",
    status: "Active",
  },
  {
    id: "u-student-04",
    studentId: "STU-3033",
    name: "Karthik V.",
    email: "karthik.v@campusfix.demo",
    department: "Mechanical",
    status: "Active",
  },
  {
    id: "u-student-05",
    studentId: "STU-3041",
    name: "Divya M.",
    email: "divya.m@campusfix.demo",
    department: "Civil",
    status: "Active",
  },
  {
    id: "u-student-06",
    studentId: "STU-3052",
    name: "Aditya K.",
    email: "aditya.k@campusfix.demo",
    department: "CSE",
    status: "Inactive",
  },
]
