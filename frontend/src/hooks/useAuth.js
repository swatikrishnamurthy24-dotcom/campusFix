import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

// useAuth — thin accessor for AuthContext.
// Usage: const { user, isAuthenticated, isLoading, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
