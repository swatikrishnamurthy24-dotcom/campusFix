import { Outlet, useMatches } from "react-router-dom"
import Sidebar from "@/components/layout/Sidebar"
import TopHeader from "@/components/layout/TopHeader"

/**
 * AppLayout — the shared shell (sidebar + header + content area) used by
 * every role-based layout. navItems/roleLabel are passed in by
 * StudentLayout/StaffLayout/AdminLayout so this component itself has no
 * idea which portal it's rendering. The signed-in user is read directly
 * from AuthContext inside TopHeader (see Phase 3B §9), not threaded through
 * here as props.
 *
 * pageTitle is resolved from the active route's `handle.title` (set per
 * route in AppRoutes.jsx) so each page doesn't need to manage the header.
 */
export default function AppLayout({ navItems, roleLabel }) {
  const matches = useMatches()
  const current = [...matches].reverse().find((m) => m.handle?.title)
  const pageTitle = current?.handle?.title ?? roleLabel

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar navItems={navItems} roleLabel={roleLabel} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <TopHeader pageTitle={pageTitle} navItems={navItems} roleLabel={roleLabel} />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
