// cURL command generator utility
import { safeJsonParse, safeJsonStringify, extractDomain } from './common.js'

const ERROR_MESSAGES = {
  NO_CONNECTION: 'Please select a connection and endpoint to generate cURL command',
  CONNECTION_NOT_FOUND: 'Connection not found. Please select a valid connection.'
}

const HTTP_METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH']

export const generateCurlCommand = (method, endpoint, requestBody, selectedConnection, connections) => {
  if (!selectedConnection || !endpoint) {
    return ERROR_MESSAGES.NO_CONNECTION
  }

  const connection = connections.find(conn => conn._id === selectedConnection)
  if (!connection) {
    return ERROR_MESSAGES.CONNECTION_NOT_FOUND
  }

  const baseUrl = connection.baseUrl.replace(/\/$/, '') // Remove trailing slash
  const fullUrl = `${baseUrl}${endpoint}`
  const domain = extractDomain(baseUrl)
  
  let curlCommand = `curl -X ${method} "${fullUrl}"`
  
  // Add standard headers
  const headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: token YOUR_API_KEY:YOUR_API_SECRET',
    `X-Frappe-Site: ${domain}`,
    'X-Frappe-API-Key: YOUR_API_KEY',
    'X-Frappe-API-Secret: YOUR_API_SECRET'
  ]
  
  headers.forEach(header => {
    curlCommand += ` \\\n  -H "${header}"`
  })
  
  // Add body for methods that support it
  if (HTTP_METHODS_WITH_BODY.includes(method) && requestBody) {
    const bodyData = safeJsonParse(requestBody, {})
    const bodyString = safeJsonStringify(bodyData, requestBody)
    curlCommand += ` \\\n  -d '${bodyString}'`
  }
  
  // Add query parameters for GET requests
  if (method === 'GET' && endpoint.includes('?')) {
    const urlParts = endpoint.split('?')
    if (urlParts.length > 1) {
      curlCommand += ` \\\n  -G -d "${urlParts[1]}"`
    }
  }
  
  // Add verbose flag for better debugging
  curlCommand += ` \\\n  -v`
  
  // Add instructions for replacing credentials
  curlCommand += `\n\n# Instructions:\n# 1. Replace YOUR_API_KEY with your actual API Key\n# 2. Replace YOUR_API_SECRET with your actual API Secret\n# 3. Get these from: ${baseUrl}/app/user#API Access`
  
  return curlCommand
}

/**
 * Generate cURL command with actual API credentials (for internal use)
 * This should only be used when credentials are available and user explicitly requests it
 */
export const generateCurlCommandWithCredentials = (method, endpoint, requestBody, connection) => {
  if (!connection || !connection.apiKey || !connection.apiSecret) {
    return 'API credentials not available. Please ensure connection has valid API key and secret.'
  }

  const baseUrl = connection.baseUrl.replace(/\/$/, '') // Remove trailing slash
  const fullUrl = `${baseUrl}${endpoint}`
  const domain = extractDomain(baseUrl)
  
  let curlCommand = `curl -X ${method} "${fullUrl}"`
  
  // Add standard headers with actual credentials
  const headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    `Authorization: token ${connection.apiKey}:${connection.apiSecret}`,
    `X-Frappe-Site: ${domain}`,
    `X-Frappe-API-Key: ${connection.apiKey}`,
    `X-Frappe-API-Secret: ${connection.apiSecret}`
  ]
  
  headers.forEach(header => {
    curlCommand += ` \\\n  -H "${header}"`
  })
  
  // Add body for methods that support it
  if (HTTP_METHODS_WITH_BODY.includes(method) && requestBody) {
    const bodyData = safeJsonParse(requestBody, {})
    const bodyString = safeJsonStringify(bodyData, requestBody)
    curlCommand += ` \\\n  -d '${bodyString}'`
  }
  
  // Add query parameters for GET requests
  if (method === 'GET' && endpoint.includes('?')) {
    const urlParts = endpoint.split('?')
    if (urlParts.length > 1) {
      curlCommand += ` \\\n  -G -d "${urlParts[1]}"`
    }
  }
  
  // Add verbose flag for better debugging
  curlCommand += ` \\\n  -v`
  
  return curlCommand
}
