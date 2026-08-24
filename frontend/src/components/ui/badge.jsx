import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Status/priority color coding per Phase 2 spec, Section 2.1
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground bg-transparent",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/20 text-[#92650A]",
        danger: "border-transparent bg-danger/15 text-danger",
        info: "border-transparent bg-info/15 text-[#0369A1]",
        accent: "border-transparent bg-accent/15 text-accent",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
