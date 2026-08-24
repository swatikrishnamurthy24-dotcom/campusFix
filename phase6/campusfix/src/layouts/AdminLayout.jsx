import AppLayout from "@/components/layout/AppLayout"
import { adminNav, roleMeta } from "@/routes/navConfig"

// The signed-in user (name, email, avatar) now comes from AuthContext via
// TopHeader — see Phase 3B. This layout only supplies the role-specific
// navigation, same as before.
export default function AdminLayout() {
  return <AppLayout navItems={adminNav} roleLabel={roleMeta.admin.label} />
}
