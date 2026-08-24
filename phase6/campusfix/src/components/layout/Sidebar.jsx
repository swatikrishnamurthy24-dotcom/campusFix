import { NavLink, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

/**
 * SidebarContent — the actual nav list, shared between the fixed desktop
 * sidebar and the mobile drawer (Sheet) so the two never drift apart.
 *
 * `navItems` and `roleLabel` come from src/routes/navConfig.js.
 * `onNavigate` lets the mobile drawer close itself after a link is clicked.
 */
export function SidebarContent({ navItems, roleLabel, onNavigate }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    onNavigate?.() // closes the mobile drawer, if open
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          CF
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">CampusFix</p>
          <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {navItems.map(({ label, to, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "border-l-2",
                    isActive
                      ? "border-l-primary bg-primary/10 text-primary"
                      : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}

/**
 * Sidebar — fixed desktop sidebar (hidden below the lg breakpoint).
 * Mobile navigation is handled separately by MobileSidebar in TopHeader.
 */
export default function Sidebar({ navItems, roleLabel }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
      <div className="fixed h-screen w-60">
        <SidebarContent navItems={navItems} roleLabel={roleLabel} />
      </div>
    </aside>
  )
}
