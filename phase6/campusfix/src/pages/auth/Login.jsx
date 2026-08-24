import { useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { roleMeta } from "@/routes/navConfig"
import { DEMO_CREDENTIALS } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import FullScreenLoader from "@/components/common/FullScreenLoader"

export default function Login() {
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [authError, setAuthError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auth state (from localStorage) is still resolving — wait before deciding
  // whether to show the form or redirect, so we never flash the form to an
  // already-authenticated user.
  if (authLoading) {
    return <FullScreenLoader />
  }

  // Already logged in and landed on /login directly — send them to their
  // own dashboard instead of showing the form again (Phase 3B §6/§11).
  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname ?? roleMeta[user.role]?.dashboardPath ?? "/"
    return <Navigate to={redirectTo} replace />
  }

  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = "Email or Student ID is required."
    if (!password) errors.password = "Password is required."
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setAuthError("")

    if (!validate()) return
    if (isSubmitting) return // guards against double-submit while a request is in flight

    setIsSubmitting(true)
    try {
      const authenticatedUser = await login(email, password)
      const redirectTo =
        location.state?.from?.pathname ?? roleMeta[authenticatedUser.role]?.dashboardPath ?? "/"
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setAuthError(err.message || "Something went wrong while signing in. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
            CF
          </div>
          <h1 className="text-lg font-semibold text-foreground">CampusFix</h1>
          <p className="text-sm text-muted-foreground">Saptagiri NPS University</p>
          <p className="mt-1 text-xs text-muted-foreground">Report. Track. Resolve. Improve.</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Sign in</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Use your campus email or Student ID to continue.
          </p>

          {authError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email or Student ID
              </label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                placeholder="you@campusfix.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                disabled={isSubmitting}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-xs text-danger">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => window.alert("Password reset isn't available in this preview yet.")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  disabled={isSubmitting}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="text-xs text-danger">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              {/* "Remember me" is currently UI-only: the mock session is always
                  persisted to localStorage regardless of this value (Phase 3B §5).
                  A real backend could later use this to choose a short vs. long
                  session/token lifetime. */}
              <Checkbox
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                disabled={isSubmitting}
              />
              Remember me
            </label>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        {/* DEV-ONLY: demo credentials, sourced from authService so this list can
            never silently drift out of sync with what actually works. Remove
            this block (or hide it behind an env flag) before any real deploy. */}
        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="mb-1.5 font-semibold text-foreground">Demo accounts (development only)</p>
          <ul className="space-y-0.5">
            {DEMO_CREDENTIALS.map((cred) => (
              <li key={cred.email}>
                <span className="capitalize">{cred.role}</span>: {cred.email} / {cred.password}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
