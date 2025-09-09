import express from 'express';
import { Connection, History } from '../models/index.js';
import ERPNextClient from '../erpnext/ERPNextClient.js';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse,
  asyncHandler 
} from '../utils/response.js';

const router = express.Router();

/**
 * Middleware to load connection and create ERPNextClient
 */
const loadConnectionAndClient = asyncHandler(async (req, res, next) => {
  const connectionId = req.query.connectionId || req.body.connectionId;
  
  if (!connectionId) {
    const response = validationErrorResponse('connectionId is required in query or body');
    return res.status(response.status).json(response.json);
  }

  const connection = await Connection.findById(connectionId);
  if (!connection) {
    const response = errorResponse('Connection not found', null, 404);
    return res.status(response.status).json(response.json);
  }

  // Decrypt secrets
  const apiKey = await connection.getDecryptedApiKey();
  const apiSecret = await connection.getDecryptedApiSecret();

  // Create ERPNextClient
  const client = new ERPNextClient({
    baseUrl: connection.baseUrl,
    apiKey,
    apiSecret
  });

  req.connection = connection;
  req.erpClient = client;
  next();
});

/**
 * GET /erp/doctypes
 * Get list of DocTypes from ERPNext
 */
router.get('/doctypes', loadConnectionAndClient, asyncHandler(async (req, res) => {
  const { limit = 2000 } = req.query;
  const docTypes = await req.erpClient.listDocTypes(parseInt(limit));

  const response = successResponse({
    docTypes,
    count: docTypes.length,
    connectionId: req.connection._id,
    connectionName: req.connection.name
  }, 'DocTypes retrieved successfully');
  
  res.status(response.status).json(response.json);
}));

/**
 * POST /erp/send
 * Send raw request to ERPNext and save to history
 */
router.post('/send', loadConnectionAndClient, asyncHandler(async (req, res) => {
  const { method, path, query, body } = req.body;

  // Validate required fields
  if (!method || !path) {
    const response = validationErrorResponse('method and path are required');
    return res.status(response.status).json(response.json);
  }

  // Send request to ERPNext
  const startTime = Date.now();
  const result = await req.erpClient.sendRaw({ method, path, query, body });
  const durationMs = Date.now() - startTime;

  // Save to history (non-blocking)
  History.createEntry({
    connectionId: req.connection._id,
    request: {
      method,
      path,
      query: query || {},
      body: body || {},
      docType: req.body.docType || null
    },
    response: {
      status: result.status,
      headers: result.headers || {},
      body: typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
    },
    durationMs
  }).catch(historyError => {
    console.error('Error saving to history:', historyError);
    // Don't fail the request if history saving fails
  });

  const response = successResponse({
    ...result,
    connectionId: req.connection._id,
    connectionName: req.connection.name,
    timestamp: new Date().toISOString()
  }, 'Request sent successfully');
  
  res.status(response.status).json(response.json);
}));

/**
 * GET /erp/ping
 * Test connection to ERPNext
 */
router.get('/ping', loadConnectionAndClient, asyncHandler(async (req, res) => {
  const pingResult = await req.erpClient.ping();

  const response = successResponse({
    ping: pingResult,
    connectionId: req.connection._id,
    connectionName: req.connection.name,
    baseUrl: req.connection.baseUrl,
    timestamp: new Date().toISOString()
  }, 'Ping test completed');
  
  res.status(response.status).json(response.json);
}));

/**
 * GET /erp/info
 * Get ERPNext instance information
 */
router.get('/info', loadConnectionAndClient, asyncHandler(async (req, res) => {
  const instanceInfo = await req.erpClient.getInstanceInfo();

  const response = successResponse({
    ...instanceInfo,
    connectionId: req.connection._id,
    connectionName: req.connection.name
  }, 'Instance information retrieved');
  
  res.status(response.status).json(response.json);
}));

/**
 * POST /erp/test-connection
 * Comprehensive connection test
 */
router.post('/test-connection', loadConnectionAndClient, asyncHandler(async (req, res) => {
  const testResult = await req.erpClient.testConnection();

  const response = successResponse({
    ...testResult,
    connectionId: req.connection._id,
    connectionName: req.connection.name
  }, 'Connection test completed');
  
  res.status(response.status).json(response.json);
}));

/**
 * POST /erp/generate-curl
 * Generate cURL command with actual credentials
 */
router.post('/generate-curl', loadConnectionAndClient, asyncHandler(async (req, res) => {
  const { method, path, query, body } = req.body;

  // Validate required fields
  if (!method || !path) {
    const response = validationErrorResponse('method and path are required');
    return res.status(response.status).json(response.json);
  }

  // Get decrypted credentials
  const apiKey = await req.connection.getDecryptedApiKey();
  const apiSecret = await req.connection.getDecryptedApiSecret();

  const baseUrl = req.connection.baseUrl.replace(/\/$/, '');
  const fullUrl = `${baseUrl}${path}`;
  const domain = baseUrl.split('//')[1].split('/')[0];
  
  let curlCommand = `curl -X ${method} "${fullUrl}"`;
  
  // Add standard headers with actual credentials
  const headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    `Authorization: token ${apiKey}:${apiSecret}`,
    `X-Frappe-Site: ${domain}`,
    `X-Frappe-API-Key: ${apiKey}`,
    `X-Frappe-API-Secret: ${apiSecret}`
  ];
  
  headers.forEach(header => {
    curlCommand += ` \\\n  -H "${header}"`;
  });
  
  // Add body for methods that support it
  if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    curlCommand += ` \\\n  -d '${bodyString}'`;
  }
  
  // Add query parameters for GET requests
  if (method === 'GET' && path.includes('?')) {
    const urlParts = path.split('?');
    if (urlParts.length > 1) {
      curlCommand += ` \\\n  -G -d "${urlParts[1]}"`;
    }
  }
  
  // Add verbose flag for better debugging
  curlCommand += ` \\\n  -v`;

  const response = successResponse({
    curlCommand,
    connectionId: req.connection._id,
    connectionName: req.connection.name,
    baseUrl: req.connection.baseUrl,
    timestamp: new Date().toISOString()
  }, 'cURL command generated successfully');
  
  res.status(response.status).json(response.json);
}));

export default router;
