import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Lightweight checkbox built on a native <input type="checkbox"> rather than
 * a Radix primitive — this is the only checkbox usage in the app so far
 * (Login's "Remember me"), and a native control keeps keyboard/label
 * semantics free without adding a new dependency.
 */
const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, id, ...props }, ref) => {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-input bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring checked:border-primary checked:bg-primary"
        {...props}
      />
      <Check
        className={cn(
          "pointer-events-none absolute inset-0 h-4 w-4 p-0.5 text-primary-foreground opacity-0 peer-checked:opacity-100",
          className
        )}
      />
    </span>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
