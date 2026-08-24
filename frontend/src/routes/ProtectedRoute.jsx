import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { roleMeta } from "@/routes/navConfig"
import FullScreenLoader from "@/components/common/FullScreenLoader"

// ProtectedRoute.jsx
//
// IMPORTANT: this is a UX convenience only, not a security boundary.
// It exists so an unauthenticated visitor doesn't see a role's dashboard
// shell, and so a Student can't casually click into /admin. Someone with
// devtools access can rewrite localStorage and grant themselves any role
// client-side — that's expected and fine for a mock frontend. Once a real
// backend exists, every request/action a route like this "protects" must
// ALSO be authorized server-side (see Phase 1 §22-23); nothing here
// substitutes for that.
//
// allowedRoles: optional array, e.g. ["student"]. When omitted, any
// authenticated user may access the route (used for shared/public-after-
// login pages, if any are added later).
export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Auth state is still being restored from localStorage — don't make a
  // redirect decision yet, or a logged-in user would flash-redirect to
  // /login on every page refresh.
  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const roleIsAllowed = !allowedRoles || allowedRoles.includes(user.role)
  if (!roleIsAllowed) {
    const ownDashboard = roleMeta[user.role]?.dashboardPath ?? "/login"
    return <Navigate to={ownDashboard} replace />
  }

  return <Outlet />
}
