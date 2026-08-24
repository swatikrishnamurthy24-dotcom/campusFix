// BarStat.jsx
//
// Chart-ready visualization built entirely from existing CSS/UI primitives
// (no external charting library is installed in this project — Phase 6 §10
// says to use one only if it already exists in package.json, and to build
// clean chart-ready visuals with existing components otherwise).
//
// BarList renders a labeled horizontal bar per entry, sized relative to the
// largest count. Used by the Dashboard, Analytics, and Reports pages so
// "issues by X" breakdowns always look the same.

import { cn } from "@/lib/utils"

const BAR_TONE_CLASSES = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  accent: "bg-accent",
}

export function BarList({ data, tone = "default", emptyLabel = "No data yet." }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <ul className="space-y-2.5">
      {data.map((entry) => (
        <li key={entry.label} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate font-medium text-foreground">{entry.label}</span>
            <span className="shrink-0 text-muted-foreground">{entry.count}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", BAR_TONE_CLASSES[tone])}
              style={{ width: `${Math.max((entry.count / max) * 100, entry.count > 0 ? 4 : 0)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Simple vertical column chart for monthly trends — still CSS-only. */
export function ColumnTrend({ data, emptyLabel = "Not enough data yet." }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="flex h-32 items-end gap-3">
      {data.map((entry) => (
        <div key={entry.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-xs font-medium text-foreground">{entry.count}</span>
          <div
            className="w-full rounded-t-md bg-primary/80"
            style={{ height: `${Math.max((entry.count / max) * 100, 4)}%` }}
          />
          <span className="text-[11px] text-muted-foreground">{entry.label}</span>
        </div>
      ))}
    </div>
  )
}
