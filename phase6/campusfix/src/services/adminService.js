// adminService.js
//
// Mock service abstraction for the Admin Portal (Phase 6). Shaped the same
// way as issueService.js/authService.js — every function returns a Promise
// so swapping this for real API calls later shouldn't require touching any
// component, only this file.
//
// STATE NOTE: like issueService.js, students/staff/departments/categories
// live in module-level arrays for the lifetime of the tab (mock
// "database") and reset on a full page reload. There is no real backend
// yet — see Phase 6 §21.

import { initialMockStudents } from "@/data/mockStudents"
import { initialMockStaff } from "@/data/mockStaff"
import { initialMockDepartments, CATEGORY_TO_DEPARTMENT } from "@/data/mockDepartments"
import { initialMockCategories } from "@/data/mockCategories"
import { getIssues } from "@/services/issueService"

const MOCK_DELAY_MS = 300

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// In-memory mock "tables".
let students = [...initialMockStudents]
let staff = [...initialMockStaff]
let departments = [...initialMockDepartments]
let categories = [...initialMockCategories]

// ---- Students ---------------------------------------------------------

export async function getStudents() {
  await delay()
  return [...students]
}

export async function getStudentById(studentUserId) {
  await delay(150)
  const student = students.find((s) => s.id === studentUserId)
  if (!student) throw new Error(`Student ${studentUserId} was not found.`)
  return { ...student }
}

// ---- Staff --------------------------------------------------------------

/** Staff directory enriched with a live count of currently-assigned issues. */
export async function getStaffList() {
  await delay()
  const issues = await getIssues()
  return staff.map((member) => ({
    ...member,
    assignedIssueCount: issues.filter((issue) => issue.assignedTo === member.id).length,
  }))
}

export async function getStaffById(staffUserId) {
  await delay(150)
  const member = staff.find((s) => s.id === staffUserId)
  if (!member) throw new Error(`Staff member ${staffUserId} was not found.`)
  const issues = await getIssues()
  return {
    ...member,
    assignedIssueCount: issues.filter((issue) => issue.assignedTo === staffUserId).length,
  }
}

/** Staff filtered to a department — used to suggest assignees for an issue. */
export async function getStaffByDepartment(department) {
  await delay(150)
  return staff.filter((s) => s.department === department).map((s) => ({ ...s }))
}

// ---- Departments ----------------------------------------------------------

/** Departments enriched with live staff/issue counts. */
export async function getDepartments() {
  await delay()
  const issues = await getIssues()
  return departments.map((dept) => ({
    ...dept,
    staffCount: staff.filter((s) => s.department === dept.name).length,
    issueCount: issues.filter((issue) => CATEGORY_TO_DEPARTMENT[issue.category] === dept.name).length,
  }))
}

// ---- Categories -------------------------------------------------------

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
 * issues/students/staff "tables" the rest of the Admin Portal reads, so
 * nothing here is hardcoded per Phase 6 §1's instruction.
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
  await delay()
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
