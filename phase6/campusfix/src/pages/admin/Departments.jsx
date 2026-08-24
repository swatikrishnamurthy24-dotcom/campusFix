import { useEffect, useState } from "react"
import { Building2, AlertCircle } from "lucide-react"
import { getDepartments } from "@/services/adminService"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setLoadError("")

    getDepartments()
      .then((data) => {
        if (!cancelled) setDepartments(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError("Couldn't load departments right now. Please try again.")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Departments</h2>
        <p className="text-sm text-muted-foreground">Campus maintenance departments and their workload.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-foreground">{loadError}</p>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
          <Building2 className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No departments configured yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {dept.name}
                  </CardTitle>
                  <Badge variant={dept.status === "Active" ? "success" : "muted"}>{dept.status}</Badge>
                </div>
                <CardDescription>{dept.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4 pt-0 text-sm">
                <div>
                  <p className="text-lg font-semibold text-foreground">{dept.staffCount}</p>
                  <p className="text-xs text-muted-foreground">Staff</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{dept.issueCount}</p>
                  <p className="text-xs text-muted-foreground">Issues</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
