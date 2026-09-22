/**
 * Custom API Error class that includes a status code.
 *
 * Usage:
 *   throw new ApiError(404, 'Restaurant not found');
 *   throw new ApiError(400, 'Invalid email format');
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
