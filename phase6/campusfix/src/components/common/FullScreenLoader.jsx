import { Loader2 } from "lucide-react"

/**
 * FullScreenLoader — shown while AuthContext is restoring the session from
 * localStorage on app boot. Kept intentionally simple (Phase 3B §11: no
 * flash of protected content while this resolves).
 */
export default function FullScreenLoader({ label = "Loading CampusFix…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        CF
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  )
}
