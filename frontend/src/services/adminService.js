// adminService.js
//
// Phase 7: Students and Staff directories now come from the real backend
// (GET /users), replacing the Phase 1-6 mock arrays. Departments and
// Category management remain frontend-only mock data in this phase — the
// backend has no Department/Category model (see backend/README.md
// "Notes on scope"). This was a deliberate, documented scope decision, not
// an oversight: extending the schema to cover those is straightforward
// future work.
//
// Every exported function keeps the same name/shape the mock had, so no
// Admin Portal component needed to change.

import { api } from "@/services/api"
import { initialMockDepartments, CATEGORY_TO_DEPARTMENT } from "@/data/mockDepartments"
import { initialMockCategories } from "@/data/mockCategories"
import { getIssues } from "@/services/issueService"

const MOCK_DELAY_MS = 150

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Departments/Categories still live in-memory for the lifetime of the tab
// (see file header — out of Phase 7 backend scope).
let departments = [...initialMockDepartments]
let categories = [...initialMockCategories]

/** Normalizes a backend user document into the shape Students.jsx expects. */
function toStudentShape(u) {
  return {
    id: u.id,
    studentId: u.studentId ?? "",
    name: u.name,
    email: u.email,
    department: u.department ?? "",
    status: u.status,
  }
}

/** Normalizes a backend user document into the shape Staff.jsx expects. */
function toStaffShape(u) {
  return {
    id: u.id,
    staffId: u.staffId ?? "",
    name: u.name,
    email: u.email,
    department: u.department ?? "",
    specialization: u.specialization ?? "",
    status: u.status,
  }
}

// ---- Students ---------------------------------------------------------

export async function getStudents() {
  const data = await api.get("/users?role=student")
  return data.data.map(toStudentShape)
}

export async function getStudentById(studentUserId) {
  const data = await api.get(`/users/${studentUserId}`)
  return toStudentShape(data.data)
}

// ---- Staff --------------------------------------------------------------

/** Staff directory enriched with a live count of currently-assigned issues. */
export async function getStaffList() {
  const [usersData, issues] = await Promise.all([api.get("/users?role=staff"), getIssues()])
  return usersData.data.map(toStaffShape).map((member) => ({
    ...member,
    assignedIssueCount: issues.filter((issue) => issue.assignedTo === member.id).length,
  }))
}

export async function getStaffById(staffUserId) {
  const [userData, issues] = await Promise.all([api.get(`/users/${staffUserId}`), getIssues()])
  const member = toStaffShape(userData.data)
  return {
    ...member,
    assignedIssueCount: issues.filter((issue) => issue.assignedTo === staffUserId).length,
  }
}

/** Staff filtered to a department — used to suggest assignees for an issue. */
export async function getStaffByDepartment(department) {
  const data = await api.get(`/users?role=staff&department=${encodeURIComponent(department)}`)
  return data.data.map(toStaffShape)
}

// ---- Departments ----------------------------------------------------------
// Mock-backed (no Department model in Phase 7 backend — see file header).

/** Departments enriched with live staff/issue counts. */
export async function getDepartments() {
  await delay()
  const [issues, staffData] = await Promise.all([getIssues(), api.get("/users?role=staff")])
  const staff = staffData.data.map(toStaffShape)
  return departments.map((dept) => ({
    ...dept,
    staffCount: staff.filter((s) => s.department === dept.name).length,
    issueCount: issues.filter((issue) => CATEGORY_TO_DEPARTMENT[issue.category] === dept.name).length,
  }))
}

// ---- Categories -------------------------------------------------------
// Mock-backed (no Category model in Phase 7 backend — see file header).

export async function getCategories() {
  await delay()
  return [...categories]
}

export async function addCategory({ name, description }) {
  await delay(300)
  const trimmed = (name ?? "").trim()
  if (!trimmed) throw new Error("Category name cannot be empty.")
  const newCategory = {
    id: `cat-${categories.length + 1}-${Date.now()}`,
    name: trimmed,
    description: (description ?? "").trim(),
    enabled: true,
  }
  categories = [...categories, newCategory]
  return { ...newCategory }
}

export async function updateCategory(categoryId, patch) {
  await delay(250)
  let updated = null
  categories = categories.map((cat) => {
    if (cat.id !== categoryId) return cat
    updated = { ...cat, ...patch }
    return updated
  })
  if (!updated) throw new Error(`Category ${categoryId} was not found.`)
  return { ...updated }
}

export async function setCategoryEnabled(categoryId, enabled) {
  return updateCategory(categoryId, { enabled })
}

// ---- Dashboard / Analytics ------------------------------------------------

/**
 * System-wide dashboard statistics (Phase 6 §1). Computed from the same
 * live `issues`/`students`/`staff` data the rest of the Admin Portal reads.
 */
export async function getDashboardStats() {
  const [issues, studentList, staffList] = await Promise.all([getIssues(), getStudents(), getStaffList()])

  const byStatus = (status) => issues.filter((i) => i.status === status).length
  const totalIssues = issues.length
  const resolved = byStatus("Resolved")
  const resolutionRate = totalIssues === 0 ? 0 : Math.round((resolved / totalIssues) * 100)

  return {
    totalIssues,
    pending: byStatus("Pending"),
    acknowledged: byStatus("Acknowledged"),
    inProgress: byStatus("In Progress"),
    resolved,
    rejected: byStatus("Rejected"),
    emergency: issues.filter((i) => i.priority === "Emergency").length,
    highPriority: issues.filter((i) => i.priority === "High" || i.priority === "Emergency").length,
    totalStudents: studentList.length,
    totalStaff: staffList.length,
    activeStaff: staffList.filter((s) => s.status === "Active").length,
    resolutionRate,
  }
}

/** Groups issues by a field (e.g. "status", "category", "priority") into counts. */
function countBy(items, keyFn) {
  const counts = {}
  for (const item of items) {
    const key = keyFn(item) ?? "Unassigned"
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

function monthLabel(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
}

/** Aggregated analytics for the Admin Portal's Analytics page (Phase 6 §10). */
export async function getAnalytics() {
  const issues = await getIssues()

  const byStatus = countBy(issues, (i) => i.status)
  const byCategory = countBy(issues, (i) => i.category)
  const byPriority = countBy(issues, (i) => i.priority)
  const byDepartment = countBy(issues, (i) => CATEGORY_TO_DEPARTMENT[i.category] ?? "Unassigned")

  const resolvedIssues = issues.filter((i) => i.status === "Resolved")
  const resolutionRate = issues.length === 0 ? 0 : Math.round((resolvedIssues.length / issues.length) * 100)

  const avgResolutionHours =
    resolvedIssues.length === 0
      ? 0
      : Math.round(
          resolvedIssues.reduce((sum, i) => {
            const hours = (new Date(i.updatedAt) - new Date(i.createdAt)) / (1000 * 60 * 60)
            return sum + hours
          }, 0) / resolvedIssues.length
        )

  // Monthly trend — count of issues created per calendar month, oldest first.
  const monthlyCounts = {}
  for (const issue of issues) {
    const label = monthLabel(issue.createdAt)
    monthlyCounts[label] = (monthlyCounts[label] ?? 0) + 1
  }
  const monthlyTrend = Object.entries(monthlyCounts)
    .map(([label, count]) => ({ label, count, sortKey: label }))
    .sort((a, b) => new Date(`1 ${a.label}`) - new Date(`1 ${b.label}`))
    .map(({ label, count }) => ({ label, count }))

  return {
    byStatus,
    byCategory,
    byPriority,
    byDepartment,
    resolutionRate,
    avgResolutionHours,
    monthlyTrend,
    totalIssues: issues.length,
  }
}
