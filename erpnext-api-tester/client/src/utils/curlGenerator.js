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
  
  return curlCommand
}
