// errorMiddleware.js
//
// Global error handler + 404 fallback. Formats errors safely — no stack
// traces are ever sent to the client, only in server-side console output.

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500
  let message = err.message || "Internal server error."

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404
    message = "Resource not found."
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(" ")
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field"
    message = `A record with that ${field} already exists.`
  }

  console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.originalUrl} — ${err.message}`)

  res.status(statusCode).json({
    success: false,
    message,
  })
}

module.exports = { notFound, errorHandler }
