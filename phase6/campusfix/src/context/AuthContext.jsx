import { createContext, useCallback, useMemo, useState } from "react"
import { login as loginRequest, logout as logoutRequest } from "@/services/authService"

// AuthContext.jsx
//
// Frontend-only mock authentication state. This context is the single
// source of truth for "who is logged in" across the app — Sidebar/TopHeader/
// ProtectedRoute all read from this instead of holding their own copies.
//
// SECURITY NOTE: everything here is a development convenience. The app
// trusts whatever is in localStorage under STORAGE_KEY, which means a user
// could hand-edit it in devtools to grant themselves any role. That is fine
// for a mock frontend, but it means NONE of this is a real security
// boundary — every protected action must be re-verified by a real backend
// once one exists (see Phase 1 §22-23). ProtectedRoute below exists purely
// to keep the UI honest and convenient, not to keep anyone out.

const STORAGE_KEY = "campusfix_auth"

export const AuthContext = createContext(undefined)

function readStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    // Minimal shape validation — if this doesn't look like a user we
    // recognize, treat it as corrupted rather than trusting it blindly.
    const isValidShape =
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      typeof parsed.email === "string" &&
      ["student", "staff", "admin"].includes(parsed.role)

    if (!isValidShape) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    // JSON.parse failed — corrupted data, clear it and fall back to logged-out.
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  // localStorage reads are synchronous, so the stored user (if any) is
  // resolved via useState's lazy initializer — this runs before the first
  // paint, so there's nothing to "restore" after mount and no risk of
  // flashing protected content or the login page first (Phase 3B §11).
  const [user, setUser] = useState(() => readStoredUser())

  // Kept for API stability / future-proofing: if restoration is ever backed
  // by an async call (e.g. validating a token with a real backend), this is
  // where that in-flight state would live. It's always false today because
  // readStoredUser() above already resolves synchronously.
  const [isLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    // NOTE: password never touches localStorage or this context's state —
    // it lives only inside authService's mock check and is discarded here.
    const authenticatedUser = await loginRequest(email, password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser))
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  // Lets the Profile page (Phase 4 §11) edit fields already present on the
  // user object (name, avatar) without inventing a real backend endpoint.
  // Mock-only: a real implementation would PATCH the user on the server and
  // update local state from the response instead of trusting the client.
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev
      const nextUser = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
      return nextUser
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, isLoading, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
