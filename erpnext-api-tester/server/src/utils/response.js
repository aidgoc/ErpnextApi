// Common response utilities for server routes

/**
 * Standard success response
 */
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    status: statusCode,
    json: {
      ok: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Standard error response
 */
export const errorResponse = (message, statusCode = 500, error = null) => {
  return {
    status: statusCode,
    json: {
      ok: false,
      message,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Validation error response
 */
export const validationErrorResponse = (message, missingFields = []) => {
  return {
    status: 400,
    json: {
      ok: false,
      message,
      missingFields,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Not found response
 */
export const notFoundResponse = (resource = 'Resource') => {
  return {
    status: 404,
    json: {
      ok: false,
      message: `${resource} not found`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Standard async route handler wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (body, requiredFields) => {
  const missing = requiredFields.filter(field => !body[field])
  if (missing.length > 0) {
    return {
      valid: false,
      missing,
      message: `${missing.join(', ')} are required`
    }
  }
  return { valid: true }
}

/**
 * Standard pagination response
 */
export const paginatedResponse = (data, page, limit, total) => {
  return {
    ok: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    timestamp: new Date().toISOString()
  }
}

/**
 * Standard statistics response
 */
export const statisticsResponse = (stats, connectionId, connectionName, period) => {
  return {
    ok: true,
    data: {
      ...stats,
      connectionId,
      connectionName,
      period
    },
    timestamp: new Date().toISOString()
  }
}
