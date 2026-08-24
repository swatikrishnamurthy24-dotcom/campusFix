// asyncHandler.js — wraps an async Express handler so rejected promises are
// forwarded to next(err) instead of crashing the process / hanging the
// request. Used by every controller in this project.

function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = asyncHandler
