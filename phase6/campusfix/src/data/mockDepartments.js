// mockDepartments.js — Maintenance department metadata for the Admin
// Portal (Phase 6 §8). Frontend-only mock data.
//
// Reuses STAFF_DEPARTMENTS (src/data/mockStaff.js, established in Phase 5)
// as the canonical department list rather than inventing a second one —
// per Phase 6 §17 (Data Consistency).

import { STAFF_DEPARTMENTS } from "@/data/mockStaff"

export const DEPARTMENT_DESCRIPTIONS = {
  Electrical: "Wiring, lighting, fans, and power outlet issues across campus.",
  "Civil / Maintenance": "Plumbing, furniture, classrooms, and general civil upkeep.",
  "IT / Network": "Wi-Fi, network connectivity, and lab equipment issues.",
  Housekeeping: "Cleaning, washroom upkeep, and general sanitation.",
  Security: "CCTV, access control, and campus security concerns.",
}

/**
 * Maps a student-facing issue category (src/data/mockIssues.js) to the
 * maintenance department that would naturally handle it. Used to suggest a
 * sensible default when assigning staff (Phase 6 §4) and to compute
 * per-department issue counts (Departments/Analytics pages). This is a
 * suggestion only, not an enforced rule — see Phase 6 §4/§16.
 */
export const CATEGORY_TO_DEPARTMENT = {
  Electrical: "Electrical",
  Plumbing: "Civil / Maintenance",
  Cleaning: "Housekeeping",
  Furniture: "Civil / Maintenance",
  "Internet / Network": "IT / Network",
  Classroom: "Civil / Maintenance",
  Laboratory: "IT / Network",
  Washroom: "Housekeeping",
  Security: "Security",
  Other: "Civil / Maintenance",
}

/** Static department list — status is mock-only (frontend management, §8). */
export const initialMockDepartments = STAFF_DEPARTMENTS.map((name, index) => ({
  id: `dept-${index + 1}`,
  name,
  description: DEPARTMENT_DESCRIPTIONS[name] ?? "",
  status: "Active",
}))
