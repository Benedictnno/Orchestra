/**
 * Global error handler. Register last in app.js.
 * express-async-errors ensures all async route errors reach here.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const requestId = req.id ?? null    // set by pino-http
  const logger    = req.log ?? console

  logger.error({ err, requestId }, `${req.method} ${req.originalUrl} — ${err.message}`)

  // Custom AppError / HttpError
  if (err.statusCode && err.statusCode !== 500) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
      requestId,
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }))
    return res.status(400).json({ error: 'Validation failed', errors, requestId })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ error: `${field} already exists`, requestId })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token', requestId })
  }

  const status = err.statusCode || err.status || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
    requestId,
  })
}
