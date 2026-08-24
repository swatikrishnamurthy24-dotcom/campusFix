// mockStaff.js — Staff directory + department metadata for the Staff
// Portal (Phase 5 §12). Frontend-only mock data.
//
// Only "u-staff-01" has a real demo login (see src/services/authService.js).
// The rest exist so assigned/unassigned issues across departments look
// realistic in the Staff Portal (e.g. "Assigned to Divya S.") without
// implying every staff member can sign in yet — that's Admin/backend scope.

export const STAFF_DEPARTMENTS = [
  "Electrical",
  "Civil / Maintenance",
  "IT / Network",
  "Housekeeping",
  "Security",
]

// Keyed by user id so pages can look up department/staffId for the
// authenticated user (from AuthContext) without touching authService.
export const staffDirectory = {
  "u-staff-01": { staffId: "STF-2041", name: "Arjun K.", department: "Electrical" },
  "u-staff-02": { staffId: "STF-2058", name: "Divya S.", department: "Civil / Maintenance" },
  "u-staff-03": { staffId: "STF-2077", name: "Farhan I.", department: "Security" },
  "u-staff-04": { staffId: "STF-2093", name: "Meena T.", department: "IT / Network" },
  "u-staff-05": { staffId: "STF-2104", name: "Ravi P.", department: "Housekeeping" },
}

export function getStaffDirectoryEntry(userId) {
  return staffDirectory[userId] ?? null
}

// ---- Staff Management (Admin Portal — Phase 6 §7) --------------------------
//
// Extends the same staff directory above with the extra fields the Admin
// Portal's Staff page needs (email, specialization, status). Deliberately
// built FROM staffDirectory rather than as a second, disconnected list, so
// there is still only one place staff identity/department lives.

export const STAFF_STATUSES = ["Active", "On Leave", "Inactive"]

const staffExtras = {
  "u-staff-01": {
    email: "staff@campusfix.demo",
    specialization: "Electrical wiring & fixtures",
    status: "Active",
  },
  "u-staff-02": {
    email: "divya.s@campusfix.demo",
    specialization: "Plumbing & civil repairs",
    status: "Active",
  },
  "u-staff-03": {
    email: "farhan.i@campusfix.demo",
    specialization: "CCTV & access control",
    status: "Active",
  },
  "u-staff-04": {
    email: "meena.t@campusfix.demo",
    specialization: "Network & Wi-Fi infrastructure",
    status: "On Leave",
  },
  "u-staff-05": {
    email: "ravi.p@campusfix.demo",
    specialization: "Cleaning & sanitation",
    status: "Active",
  },
}

/** Full staff directory as a list, for the Admin Portal's Staff page. */
export const initialMockStaff = Object.entries(staffDirectory).map(([userId, entry]) => ({
  id: userId,
  ...entry,
  ...staffExtras[userId],
}))
