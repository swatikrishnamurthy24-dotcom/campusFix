import { useState } from "react"
import { Pencil, Check, X, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getStaffDirectoryEntry } from "@/data/mockStaff"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

function getInitials(name) {
  if (!name) return "?"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export default function StaffProfile() {
  const { user, updateUser } = useAuth()
  // Department/Staff ID live in the staff directory (Phase 5 §12) rather
  // than on the auth user object — keeps AuthContext/authService untouched
  // per Phase 5 §15/§19 ("do not modify authentication unless necessary").
  const directoryEntry = getStaffDirectoryEntry(user.id)

  const [isEditing, setIsEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(user.name)
  const [error, setError] = useState("")
  const [savedMessage, setSavedMessage] = useState("")

  function startEditing() {
    setNameDraft(user.name)
    setError("")
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setError("")
  }

  function handleSave() {
    if (!nameDraft.trim()) {
      setError("Name cannot be empty.")
      return
    }
    // Mock-only: updates AuthContext + localStorage, same pattern as the
    // Student Portal's Profile page (Phase 4 §11). No real backend yet.
    updateUser({ name: nameDraft.trim() })
    setIsEditing(false)
    setSavedMessage("Profile updated.")
    setTimeout(() => setSavedMessage(""), 2500)
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Your CampusFix staff account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {savedMessage && (
            <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {savedMessage}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold text-foreground">{user.name}</p>
              <p className="text-sm capitalize text-muted-foreground">{user.role}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="profile-name"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    aria-invalid={Boolean(error)}
                    autoFocus
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={handleSave} aria-label="Save name">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={cancelEditing} aria-label="Cancel editing">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground">{user.name}</p>
                  <Button type="button" size="sm" variant="ghost" onClick={startEditing}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              )}
              {error && <p className="text-xs text-danger">{error}</p>}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Role</p>
              <p className="text-sm capitalize text-muted-foreground">{user.role}</p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Staff ID</p>
              <p className="text-sm text-muted-foreground">
                {directoryEntry?.staffId ?? "Not linked yet — this will sync once accounts are provisioned by admin."}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Department</p>
              <p className="text-sm text-muted-foreground">
                {directoryEntry?.department ?? "Not assigned yet."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
