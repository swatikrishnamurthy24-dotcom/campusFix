// authService.js
//
// Phase 7: real authentication against the backend API. Replaces the
// Phase 1-6 mock (DEMO_ACCOUNTS + client-side password check) with actual
// POST /auth/login and /auth/register calls. Exported function signatures
// are unchanged from the mock — AuthContext.jsx and the Login page still
// call `login(email, password)` / `logout()` without knowing (or caring)
// that the implementation now talks to a real server, per the original
// design note this file used to carry.
//
// SECURITY NOTE: the JWT is stored in localStorage (see api.js,
// TOKEN_STORAGE_KEY) and sent as `Authorization: Bearer <token>` on every
// request. The backend re-verifies it and re-checks role permissions on
// every protected route — this file/AuthContext are not the security
// boundary, the backend is (see backend/src/middleware/authMiddleware.js).

import { api, setToken, getToken } from "@/services/api"

/**
 * Attempts to authenticate with an email + password against the real
 * backend. Returns the public user object (never the password) on success
 * and stores the JWT for subsequent requests. Throws an Error with a
 * user-facing message on failure.
 */
export async function login(email, password) {
  const data = await api.post("/auth/login", { email: email.trim(), password })
  setToken(data.token)
  return data.user
}

/**
 * Registers a new student account and logs them in immediately (mirrors
 * login()'s return shape). Staff/admin accounts are created by an admin
 * via the Users API instead — see backend/src/controllers/userController.js.
 */
export async function register({ name, email, password, studentId, department }) {
  const data = await api.post("/auth/register", { name, email: email.trim(), password, studentId, department })
  setToken(data.token)
  return data.user
}

/**
 * Restores a session from a previously-stored JWT by asking the backend
 * who it belongs to. Returns `null` (rather than throwing) when there is
 * no token or the token is invalid/expired, so callers can treat both as
 * "not logged in" without a try/catch.
 */
export async function getSession() {
  if (!getToken()) return null
  try {
    const data = await api.get("/auth/me")
    return data.user
  } catch {
    setToken(null)
    return null
  }
}

/** Logs out: clears the stored token. Also pings the backend for symmetry. */
export async function logout() {
  try {
    if (getToken()) await api.post("/auth/logout")
  } catch {
    // Logout should never fail from the user's perspective — even if the
    // network call fails, we still clear the local token below.
  } finally {
    setToken(null)
  }
  return true
}

// Exposed only so the Login page can show demo credentials to developers
// (Login.jsx, "Demo accounts" block). These match backend/src/utils/
// seedDatabase.js exactly — run `npm run seed` in backend/ to create them.
// Never do this in a production build; these are DEVELOPMENT ONLY.
export const DEMO_CREDENTIALS = [
  { email: "student@campusfix.demo", password: "student123", role: "student" },
  { email: "staff@campusfix.demo", password: "staff123", role: "staff" },
  { email: "admin@campusfix.demo", password: "admin123", role: "admin" },
]
