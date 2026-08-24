// api.js
//
// Centralized HTTP client for the CampusFix Phase 7 backend. Every other
// service module (authService.js, issueService.js, adminService.js) routes
// its requests through here instead of calling `fetch` directly, so token
// injection, base-URL configuration, and error shaping live in exactly one
// place — matching the "swap the mock for a real client without touching
// components" design the Phase 1-6 service layer already established.
//
// Reads the backend's base URL from VITE_API_URL (see .env.example) rather
// than hardcoding it anywhere in the app, per Phase 7 spec §2.

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"

const TOKEN_STORAGE_KEY = "campusfix_token"

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

/**
 * Low-level request helper. Attaches the JWT (if present) as a Bearer
 * token, JSON-encodes the body, and throws an Error with a user-facing
 * `message` on any non-2xx response so callers can keep using
 * `catch (err) { setError(err.message) }` exactly like the old mock
 * services did.
 */
async function request(path, { method = "GET", body, headers = {}, ...rest } = {}) {
  const token = getToken()

  const finalHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    })
  } catch {
    throw new Error("Could not reach the server. Please check your connection and try again.")
  }

  let payload = null
  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    payload = await response.json().catch(() => null)
  }

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}.`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return payload
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
}

export default api
