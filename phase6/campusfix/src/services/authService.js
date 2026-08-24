// authService.js
//
// Mock authentication service. This is the ONLY file that knows the demo
// accounts exist — AuthContext and the Login page call `login()`/`logout()`
// here without knowing (or caring) that the implementation is fake.
//
// WHEN A REAL BACKEND EXISTS: replace the bodies of login()/getSession()
// below with real API calls (e.g. POST /api/auth/login). Nothing outside
// this file should need to change, since AuthContext only depends on this
// module's exported function signatures, not its internals.
//
// SECURITY NOTE: this is frontend-only mock authentication for development.
// It is not secure and must never be used in production. Passwords here are
// compared in plaintext in the browser purely so the UI has something to
// demo against — a real implementation must verify credentials on a server.

const DEMO_ACCOUNTS = [
  {
    id: "u-student-01",
    name: "Swati R.",
    email: "student@campusfix.demo",
    password: "student123", // DEV-ONLY. Never store/compare passwords client-side in production.
    role: "student",
    avatar: null,
  },
  {
    id: "u-staff-01",
    name: "Arjun K.",
    email: "staff@campusfix.demo",
    password: "staff123",
    role: "staff",
    avatar: null,
  },
  {
    id: "u-admin-01",
    name: "Priya M.",
    email: "admin@campusfix.demo",
    password: "admin123",
    role: "admin",
    avatar: null,
  },
]

// Simulates realistic network latency so loading states are visible/testable.
const MOCK_DELAY_MS = 600

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Attempts to authenticate with an email + password.
 * Returns the public user object (never the password) on success.
 * Throws an Error with a user-facing message on failure.
 */
export async function login(email, password) {
  await delay(MOCK_DELAY_MS)

  const normalizedEmail = email.trim().toLowerCase()
  const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === normalizedEmail)

  if (!account || account.password !== password) {
    throw new Error("Invalid email or password. Please try again.")
  }

  // eslint-disable-next-line no-unused-vars
  const { password: _password, ...publicUser } = account
  return publicUser
}

/** Mock "server-side" logout — a real backend might invalidate a session/token here. */
export async function logout() {
  await delay(150)
  return true
}

// Exposed only so the Login page can show demo credentials to developers.
// Never do this in a production build.
export const DEMO_CREDENTIALS = DEMO_ACCOUNTS.map(({ email, password, role }) => ({
  email,
  password,
  role,
}))
