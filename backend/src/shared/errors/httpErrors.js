/**
 * Standard HTTP Error Classes for Domain and Service Layers
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.status = statusCode
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details = null) {
    super(message, 404, details)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details = null) {
    super(message, 409, details)
  }
}
