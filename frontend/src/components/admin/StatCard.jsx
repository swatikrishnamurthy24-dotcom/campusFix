import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TONE_CLASSES = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-[#92650A]",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-[#0369A1]",
  accent: "bg-accent/15 text-accent",
}

/**
 * Compact stat tile used across the Admin Dashboard and Analytics page so
 * both read the same visual language. `icon` is a lucide-react component.
 */
export default function StatCard({ icon: Icon, label, value, tone = "default", className }) {
  return (
    <Card className={cn("p-4", className)}>
      <CardContent className="flex items-center gap-3 p-0">
        {Icon && (
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", TONE_CLASSES[tone])}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-tight text-foreground">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
