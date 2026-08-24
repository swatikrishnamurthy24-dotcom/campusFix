import { createContext, useCallback, useEffect, useMemo, useState } from "react"
import {
  login as loginRequest,
  logout as logoutRequest,
  getSession,
} from "@/services/authService"
import { api } from "@/services/api"

// AuthContext.jsx
//
// Phase 7: real authentication state, backed by a JWT verified server-side
// on every request. This context remains the single source of truth for
// "who is logged in" across the app — Sidebar/TopHeader/ProtectedRoute all
// read from this instead of holding their own copies, same as Phase 1-6.
//
// SECURITY NOTE: unlike the Phase 1-6 mock, the token stored here cannot
// be hand-edited in devtools to grant a different role — every protected
// route re-verifies the JWT and re-checks the role server-side (see
// backend/src/middleware/authMiddleware.js and authorizeMiddleware.js).
// ProtectedRoute below is still just a UX convenience for the SPA shell;
// the backend is the actual boundary.

export const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Session restoration now requires an async round-trip to GET /auth/me
  // to verify the stored JWT is still valid — unlike the old synchronous
  // localStorage read, so this starts true and flips false once resolved.
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getSession()
      .then((restoredUser) => {
        if (!cancelled) setUser(restoredUser)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const authenticatedUser = await loginRequest(email, password)
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  // Lets the Profile page (Phase 4 §11) edit fields already present on the
  // user object (name, avatar). Now persists via PATCH /users/me instead
  // of only writing to localStorage — local state updates from the
  // server's response so it never drifts from what was actually saved.
  const updateUser = useCallback(async (patch) => {
    const data = await api.patch("/users/me", patch)
    setUser((prev) => (prev ? { ...prev, ...data.data } : prev))
    return data.data
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
