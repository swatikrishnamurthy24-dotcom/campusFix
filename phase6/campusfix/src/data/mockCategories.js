// mockCategories.js — Issue category management for the Admin Portal
// (Phase 6 §9). Frontend-only mock data.
//
// Seeded FROM the same ISSUE_CATEGORIES list the Student Portal already
// uses (src/data/mockIssues.js, Phase 4) rather than a second, incompatible
// category list — per Phase 6 §17 (Data Consistency).

import { ISSUE_CATEGORIES } from "@/data/mockIssues"

const CATEGORY_DESCRIPTIONS = {
  Electrical: "Fans, lighting, wiring, and power outlet problems.",
  Plumbing: "Leaks, blocked drains, and water supply issues.",
  Cleaning: "General housekeeping and sanitation requests.",
  Furniture: "Broken desks, chairs, and fixtures.",
  "Internet / Network": "Wi-Fi and network connectivity problems.",
  Classroom: "Projectors, boards, and other classroom equipment.",
  Laboratory: "Lab equipment and workstation issues.",
  Washroom: "Washroom cleanliness and fixture problems.",
  Security: "CCTV, access control, and safety concerns.",
  Other: "Anything that doesn't fit an existing category.",
}

export const initialMockCategories = ISSUE_CATEGORIES.map((name, index) => ({
  id: `cat-${index + 1}`,
  name,
  description: CATEGORY_DESCRIPTIONS[name] ?? "",
  enabled: true,
}))
