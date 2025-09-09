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
 * Debounce function for performance
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
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

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}
