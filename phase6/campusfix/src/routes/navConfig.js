// Sidebar navigation config per role, sourced directly from the
// Phase 1 Blueprint (Sections 8-10) and Phase 2 UI/UX Spec (Sections 4-6).
// Kept as data (not JSX) so Sidebar.jsx stays a single reusable component
// across all three portals.

import {
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  MapPin,
  Bell,
  History,
  Star,
  UserCircle,
  Settings,
  LogOut,
  AlertTriangle,
  ClipboardList,
  Paperclip,
  MessageSquare,
  BarChart3,
  Users,
  UsersRound,
  Building2,
  FileBarChart,
  Inbox,
  Tag,
} from "lucide-react"

export const studentNav = [
  { label: "Dashboard", to: "/student", icon: LayoutDashboard, end: true },
  { label: "Report Issue", to: "/student/report", icon: PlusCircle },
  { label: "My Issues", to: "/student/issues", icon: ListChecks },
  { label: "Campus Map", to: "/student/campus-map", icon: MapPin },
  { label: "Notifications", to: "/student/notifications", icon: Bell },
  { label: "Issue History", to: "/student/issue-history", icon: History },
  { label: "Feedback", to: "/student/feedback", icon: Star },
  { label: "My Profile", to: "/student/profile", icon: UserCircle },
  { label: "Settings", to: "/student/settings", icon: Settings },
]

export const staffNav = [
  { label: "Dashboard", to: "/staff", icon: LayoutDashboard, end: true },
  { label: "Assigned Issues", to: "/staff/assigned-issues", icon: ClipboardList },
  { label: "Priority Issues", to: "/staff/priority-issues", icon: AlertTriangle },
  { label: "Campus Map", to: "/staff/campus-map", icon: MapPin },
  { label: "Work Management", to: "/staff/work-management", icon: ListChecks },
  { label: "Attachments", to: "/staff/attachments", icon: Paperclip },
  { label: "Comments", to: "/staff/comments", icon: MessageSquare },
  { label: "Performance", to: "/staff/performance", icon: BarChart3 },
  { label: "Notifications", to: "/staff/notifications", icon: Bell },
  { label: "Profile", to: "/staff/profile", icon: UserCircle },
  { label: "Settings", to: "/staff/settings", icon: Settings },
]

// Admin navigation — Phase 6 §14. Earlier phases sketched several
// placeholder items (Pending/In Progress/Emergency as separate pages,
// Campus Map, Network Monitoring, System Settings) that were never built;
// those are replaced with the Phase 6 recommended nav below, which matches
// the Admin Portal pages that actually exist. Status/priority filtering for
// issues now lives inside All Issues instead of separate nav entries.
export const adminNav = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "All Issues", to: "/admin/issues", icon: Inbox },
  { label: "Students", to: "/admin/students", icon: Users },
  { label: "Staff", to: "/admin/staff", icon: UsersRound },
  { label: "Departments", to: "/admin/departments", icon: Building2 },
  { label: "Categories", to: "/admin/categories", icon: Tag },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Reports", to: "/admin/reports", icon: FileBarChart },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Profile", to: "/admin/profile", icon: UserCircle },
]

export const roleMeta = {
  student: { label: "Student Portal", nav: studentNav, dashboardPath: "/student" },
  staff: { label: "Staff Portal", nav: staffNav, dashboardPath: "/staff" },
  admin: { label: "Admin Portal", nav: adminNav, dashboardPath: "/admin" },
}

export { LogOut }
