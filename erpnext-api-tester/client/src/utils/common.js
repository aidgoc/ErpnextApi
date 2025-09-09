// Common utilities for repeated patterns

/**
 * Standard API response handler
 */
export const handleApiResponse = (response, onSuccess, onError) => {
  if (response.ok) {
    onSuccess(response.data)
    return { success: true, data: response.data }
  } else {
    onError(response.message)
    return { success: false, error: response.message }
  }
}

/**
 * Standard error handler
 */
export const handleError = (error, defaultMessage) => {
  const message = error.response?.data?.message || error.message || defaultMessage
  return { success: false, error: message }
}

/**
 * Safe JSON parsing with fallback
 */
export const safeJsonParse = (jsonString, fallback = {}) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return fallback
  }
}

/**
 * Safe JSON stringify with fallback
 */
export const safeJsonStringify = (obj, fallback = '{}') => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return fallback
  }
}

/**
 * Validate required fields
 */
export const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field])
  if (missing.length > 0) {
    return { valid: false, missing }
  }
  return { valid: true }
}

/**
 * Format connection display name
 */
export const formatConnectionName = (connection) => {
  return `${connection.name} - ${connection.baseUrl}`
}

/**
 * Extract domain from URL
 */
export const extractDomain = (url) => {
  try {
    return new URL(url).hostname
  } catch (error) {
    return url
  }
}


/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

