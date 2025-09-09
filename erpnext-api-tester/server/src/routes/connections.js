import express from 'express';
import { Connection } from '../models/index.js';
import ERPNextClient from '../erpnext/ERPNextClient.js';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse, 
  notFoundResponse,
  asyncHandler,
  validateRequiredFields 
} from '../utils/response.js';

const router = express.Router();

/**
 * DELETE /connections/reset
 * Clear all connections (for fixing encryption key issues)
 */
router.delete('/reset', asyncHandler(async (req, res) => {
  await Connection.deleteMany({});
  const response = successResponse(null, 'All connections cleared successfully');
  res.status(response.status).json(response.json);
}));

/**
 * POST /connections
 * Create a new connection with encrypted secrets and test ping
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name, baseUrl, apiKey, apiSecret } = req.body;

  // Validate required fields
  const validation = validateRequiredFields(req.body, ['name', 'baseUrl', 'apiKey', 'apiSecret']);
  if (!validation.valid) {
    const response = validationErrorResponse(validation.message, validation.missing);
    return res.status(response.status).json(response.json);
  }

  // Create connection with encrypted secrets
  const connection = await Connection.createWithSecrets({
    name,
    baseUrl,
    apiKey,
    apiSecret
  });

  // Test the connection
  const client = new ERPNextClient({ baseUrl, apiKey, apiSecret });
  const pingResult = await client.ping();

  // Return connection without secrets
  const responseData = {
    _id: connection._id,
    name: connection.name,
    baseUrl: connection.baseUrl,
    hasSecrets: connection.hasSecrets,
    createdAt: connection.createdAt,
    ping: pingResult
  };

  const message = pingResult ? 'Connection created and tested successfully' : 'Connection created but ping failed';
  const response = successResponse(responseData, message, 201);
  res.status(response.status).json(response.json);
}));

/**
 * GET /connections
 * List all connections (omit secrets)
 */
router.get('/', asyncHandler(async (req, res) => {
  const connections = await Connection.find()
    .select('-apiKeyEnc -apiSecretEnc -apiKeyIvBase64 -apiKeyTagBase64 -apiSecretIvBase64 -apiSecretTagBase64')
    .sort({ createdAt: -1 });

  const response = successResponse(connections, 'Connections retrieved successfully');
  res.status(response.status).json(response.json);
}));

/**
 * PATCH /connections/:id
 * Update connection (name, baseUrl, and optionally rotate secrets)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, baseUrl, apiKey, apiSecret } = req.body;

    const connection = await Connection.findById(id);
    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
    }

    // Update basic fields
    const updateData = {};
    if (name) updateData.name = name;
    if (baseUrl) updateData.baseUrl = baseUrl;

    // If new secrets provided, encrypt and update them
    if (apiKey && apiSecret) {
      const { encryptSecret } = await import('../utils/crypto.js');
      const { ENCRYPTION_KEY_BASE64 } = await import('../utils/env.js');

      const encryptedKey = encryptSecret(apiKey, ENCRYPTION_KEY_BASE64);
      const encryptedSecret = encryptSecret(apiSecret, ENCRYPTION_KEY_BASE64);

      updateData.apiKeyEnc = encryptedKey.cipherTextBase64;
      updateData.apiSecretEnc = encryptedSecret.cipherTextBase64;
      updateData.ivBase64 = encryptedKey.ivBase64;
      updateData.tagBase64 = encryptedKey.tagBase64;
    }

    const updatedConnection = await Connection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // Test connection if secrets were updated
    let pingResult = null;
    if (apiKey && apiSecret) {
      const client = new ERPNextClient({ baseUrl: updatedConnection.baseUrl, apiKey, apiSecret });
      pingResult = await client.ping();
    }

    // Return updated connection without secrets
    const response = {
      _id: updatedConnection._id,
      name: updatedConnection.name,
      baseUrl: updatedConnection.baseUrl,
      hasSecrets: updatedConnection.hasSecrets,
      createdAt: updatedConnection.createdAt,
      updatedAt: updatedConnection.updatedAt,
      ping: pingResult
    };

    res.json({
      ok: true,
      data: response,
      message: pingResult !== null ? 
        (pingResult ? 'Connection updated and tested successfully' : 'Connection updated but ping failed') :
        'Connection updated successfully'
    });
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * DELETE /connections/:id
 * Delete a connection
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await Connection.findByIdAndDelete(id);
    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
    }

    res.json({
      ok: true,
      message: 'Connection deleted successfully',
      data: {
        _id: connection._id,
        name: connection.name
      }
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /connections/:id
 * Get a single connection (without secrets)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await Connection.findById(id)
      .select('-apiKeyEnc -apiSecretEnc -ivBase64 -tagBase64');

    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
    }

    res.json({
      ok: true,
      data: connection
    });
  } catch (error) {
    console.error('Error fetching connection:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

export default router;

