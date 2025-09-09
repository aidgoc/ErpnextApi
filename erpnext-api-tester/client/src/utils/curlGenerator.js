// cURL command generator utility

export const generateCurlCommand = (method, endpoint, requestBody, selectedConnection, connections) => {
  if (!selectedConnection || !endpoint) {
    return 'Please select a connection and endpoint to generate cURL command'
  }

  const connection = connections.find(conn => conn._id === selectedConnection)
  if (!connection) {
    return 'Connection not found. Please select a valid connection.'
  }

  const baseUrl = connection.baseUrl.replace(/\/$/, '') // Remove trailing slash
  const fullUrl = `${baseUrl}${endpoint}`
  
  let curlCommand = `curl -X ${method} "${fullUrl}"`
  
  // Add headers
  curlCommand += ` \\\n  -H "Content-Type: application/json"`
  curlCommand += ` \\\n  -H "Accept: application/json"`
  
  // Add ERPNext authentication headers
  curlCommand += ` \\\n  -H "Authorization: token YOUR_API_KEY:YOUR_API_SECRET"`
  curlCommand += ` \\\n  -H "X-Frappe-Site: ${baseUrl.split('//')[1].split('/')[0]}"`
  curlCommand += ` \\\n  -H "X-Frappe-API-Key: YOUR_API_KEY"`
  curlCommand += ` \\\n  -H "X-Frappe-API-Secret: YOUR_API_SECRET"`
  
  // Add body for POST/PUT requests
  if ((method === 'POST' || method === 'PUT') && requestBody) {
    try {
      const bodyData = JSON.parse(requestBody)
      const bodyString = JSON.stringify(bodyData)
      curlCommand += ` \\\n  -d '${bodyString}'`
    } catch (error) {
      curlCommand += ` \\\n  -d '${requestBody}'`
    }
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
