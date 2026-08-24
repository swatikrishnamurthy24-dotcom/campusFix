import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"

import ProtectedRoute from "@/routes/ProtectedRoute"
import { roleMeta } from "@/routes/navConfig"
import { useAuth } from "@/hooks/useAuth"
import FullScreenLoader from "@/components/common/FullScreenLoader"

import Login from "@/pages/auth/Login"
import StudentLayout from "@/layouts/StudentLayout"
import StaffLayout from "@/layouts/StaffLayout"
import AdminLayout from "@/layouts/AdminLayout"

import StudentDashboard from "@/pages/student/Dashboard"
import ReportIssue from "@/pages/student/ReportIssue"
import MyIssues from "@/pages/student/MyIssues"
import IssueDetails from "@/pages/student/IssueDetails"
import StudentNotifications from "@/pages/student/Notifications"
import StudentProfile from "@/pages/student/Profile"
import StaffDashboard from "@/pages/staff/Dashboard"
import AssignedIssues from "@/pages/staff/AssignedIssues"
import StaffIssueDetails from "@/pages/staff/IssueDetails"
import StaffNotifications from "@/pages/staff/Notifications"
import StaffProfile from "@/pages/staff/Profile"
import AdminDashboard from "@/pages/admin/Dashboard"
import AdminAllIssues from "@/pages/admin/AllIssues"
import AdminIssueDetails from "@/pages/admin/IssueDetails"
import AdminStudents from "@/pages/admin/Students"
import AdminStaff from "@/pages/admin/Staff"
import AdminDepartments from "@/pages/admin/Departments"
import AdminCategories from "@/pages/admin/Categories"
import AdminAnalytics from "@/pages/admin/Analytics"
import AdminReports from "@/pages/admin/Reports"
import AdminNotifications from "@/pages/admin/Notifications"
import AdminProfile from "@/pages/admin/Profile"

/**
 * RootRedirect — handles "/". Sends an authenticated visitor straight to
 * their own dashboard, and an unauthenticated one to /login, instead of
 * rendering any UI of its own.
 */
function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) {
    return <Navigate to={roleMeta[user.role]?.dashboardPath ?? "/login"} replace />
  }
  return <Navigate to="/login" replace />
}

/**
 * Central route tree.
 *
 * Each role has its own layout route (StudentLayout/StaffLayout/AdminLayout)
 * so the sidebar + header are never re-rendered from scratch between pages
 * of the same portal. `handle.title` on each child route feeds AppLayout's
 * page title in the header — see components/layout/AppLayout.jsx.
 *
 * ProtectedRoute wraps each role's branch and checks auth + role before
 * rendering the layout underneath (see routes/ProtectedRoute.jsx).
 *
 * NOTE: this route tree is NOT the security boundary. It only controls what
 * the UI shows/hides — someone can still hit an API directly. Real
 * authorization must be enforced by the backend once one exists (Phase 1
 * §22-23); ProtectedRoute here is a UX convenience only.
 *
 * Student Portal pages (Report Issue, My Issues, Issue Details,
 * Notifications, Profile) were added in Phase 4 — see Phase 4 §12.
 * Staff Portal pages (Assigned Issues, Issue Details, Notifications,
 * Profile) were added in Phase 5 — see Phase 5 §13. Admin remains
 * Dashboard-only until its own phase.
 */
const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <Login /> },

  {
    path: "/student",
    element: <ProtectedRoute allowedRoles={["student"]} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { index: true, element: <StudentDashboard />, handle: { title: "Dashboard" } },
          { path: "report", element: <ReportIssue />, handle: { title: "Report Issue" } },
          { path: "issues", element: <MyIssues />, handle: { title: "My Issues" } },
          { path: "issues/:issueId", element: <IssueDetails />, handle: { title: "Issue Details" } },
          { path: "notifications", element: <StudentNotifications />, handle: { title: "Notifications" } },
          { path: "profile", element: <StudentProfile />, handle: { title: "My Profile" } },
        ],
      },
    ],
  },

  {
    path: "/staff",
    element: <ProtectedRoute allowedRoles={["staff"]} />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { index: true, element: <StaffDashboard />, handle: { title: "Dashboard" } },
          { path: "assigned-issues", element: <AssignedIssues />, handle: { title: "Assigned Issues" } },
          { path: "assigned-issues/:issueId", element: <StaffIssueDetails />, handle: { title: "Issue Details" } },
          { path: "notifications", element: <StaffNotifications />, handle: { title: "Notifications" } },
          { path: "profile", element: <StaffProfile />, handle: { title: "Profile" } },
        ],
      },
    ],
  },

  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard />, handle: { title: "Dashboard" } },
          { path: "issues", element: <AdminAllIssues />, handle: { title: "All Issues" } },
          { path: "issues/:issueId", element: <AdminIssueDetails />, handle: { title: "Issue Details" } },
          { path: "students", element: <AdminStudents />, handle: { title: "Students" } },
          { path: "staff", element: <AdminStaff />, handle: { title: "Staff" } },
          { path: "departments", element: <AdminDepartments />, handle: { title: "Departments" } },
          { path: "categories", element: <AdminCategories />, handle: { title: "Categories" } },
          { path: "analytics", element: <AdminAnalytics />, handle: { title: "Analytics" } },
          { path: "reports", element: <AdminReports />, handle: { title: "Reports" } },
          { path: "notifications", element: <AdminNotifications />, handle: { title: "Notifications" } },
          { path: "profile", element: <AdminProfile />, handle: { title: "Profile" } },
        ],
      },
    ],
  },

  // Fallback: unknown paths resolve the same way "/" does.
  { path: "*", element: <RootRedirect /> },
])

export default function AppRoutes() {
  return <RouterProvider router={router} />
}
