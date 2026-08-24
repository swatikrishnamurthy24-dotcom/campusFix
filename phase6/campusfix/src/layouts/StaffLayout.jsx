import AppLayout from "@/components/layout/AppLayout"
import { staffNav, roleMeta } from "@/routes/navConfig"

// The signed-in user (name, email, avatar) now comes from AuthContext via
// TopHeader — see Phase 3B. This layout only supplies the role-specific
// navigation, same as before.
export default function StaffLayout() {
  return <AppLayout navItems={staffNav} roleLabel={roleMeta.staff.label} />
}
