class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.success = false;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden access') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      ...(this.details && { details: this.details }),
      statusCode: this.statusCode,
    };
  }
}

module.exports = {
  ApiError
};