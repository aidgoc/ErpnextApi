import express from 'express';
import { CustomEndpoint, Connection } from '../models/index.js';
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse,
  notFoundResponse,
  asyncHandler 
} from '../utils/response.js';

const router = express.Router();

/**
 * POST /custom
 * Create a new custom endpoint
 */
router.post('/', asyncHandler(async (req, res) => {
  const { label, method, path, notes, connectionId } = req.body;

  // Validate required fields
  if (!label || !method || !path || !connectionId) {
    const response = validationErrorResponse('label, method, path, and connectionId are required');
    return res.status(response.status).json(response.json);
  }

  // Create custom endpoint
  const customEndpoint = await CustomEndpoint.createEndpoint({
    label,
    method,
    path,
    notes,
    connectionId
  });

  // Populate connection info
  await customEndpoint.populate('connectionId', 'name baseUrl');

  const response = successResponse(customEndpoint, 'Custom endpoint created successfully', 201);
  res.status(response.status).json(response.json);
}));

/**
 * GET /custom
 * List custom endpoints for a connection
 */
router.get('/', asyncHandler(async (req, res) => {
  const { connectionId, method, search, limit = 50, page = 1 } = req.query;

  if (!connectionId) {
    const response = validationErrorResponse('connectionId is required');
    return res.status(response.status).json(response.json);
  }

  // Validate connection exists
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    const response = notFoundResponse('Connection');
    return res.status(response.status).json(response.json);
  }

  // Build query
  const query = { connectionId };
  if (method) query.method = method.toUpperCase();
  if (search) {
    query.$or = [
      { label: { $regex: search, $options: 'i' } },
      { path: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const customEndpoints = await CustomEndpoint.find(query)
    .populate('connectionId', 'name baseUrl')
    .sort({ method: 1, path: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalCount = await CustomEndpoint.countDocuments(query);

  const response = successResponse({
    customEndpoints,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalCount,
      pages: Math.ceil(totalCount / parseInt(limit))
    }
  }, 'Custom endpoints retrieved successfully');
  
  res.status(response.status).json(response.json);
}));

/**
 * GET /custom/:id
 * Get a single custom endpoint
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customEndpoint = await CustomEndpoint.findById(id)
      .populate('connectionId', 'name baseUrl');

    if (!customEndpoint) {
      return res.status(404).json({
        ok: false,
        message: 'Custom endpoint not found'
      });
    }

    res.json({
      ok: true,
      data: customEndpoint
    });
  } catch (error) {
    console.error('Error fetching custom endpoint:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * PATCH /custom/:id
 * Update a custom endpoint
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { label, method, path, notes } = req.body;

    const customEndpoint = await CustomEndpoint.findById(id);
    if (!customEndpoint) {
      return res.status(404).json({
        ok: false,
        message: 'Custom endpoint not found'
      });
    }

    // Update fields
    const updateData = {};
    if (label) updateData.label = label;
    if (method) updateData.method = method.toUpperCase();
    if (path) updateData.path = path;
    if (notes !== undefined) updateData.notes = notes;

    const updatedEndpoint = await CustomEndpoint.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('connectionId', 'name baseUrl');

    res.json({
      ok: true,
      data: updatedEndpoint,
      message: 'Custom endpoint updated successfully'
    });
  } catch (error) {
    console.error('Error updating custom endpoint:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * DELETE /custom/:id
 * Delete a custom endpoint
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customEndpoint = await CustomEndpoint.findByIdAndDelete(id);
    if (!customEndpoint) {
      return res.status(404).json({
        ok: false,
        message: 'Custom endpoint not found'
      });
    }

    res.json({
      ok: true,
      message: 'Custom endpoint deleted successfully',
      data: {
        _id: customEndpoint._id,
        label: customEndpoint.label,
        method: customEndpoint.method,
        path: customEndpoint.path
      }
    });
  } catch (error) {
    console.error('Error deleting custom endpoint:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * POST /custom/:id/execute
 * Execute a custom endpoint
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { query, body } = req.body; // Optional query and body overrides

    const customEndpoint = await CustomEndpoint.findById(id)
      .populate('connectionId');
    
    if (!customEndpoint) {
      return res.status(404).json({
        ok: false,
        message: 'Custom endpoint not found'
      });
    }

    // Import ERPNextClient and execute the request
    const ERPNextClient = (await import('../erpnext/ERPNextClient.js')).default;
    
    // Decrypt connection secrets
    const apiKey = await customEndpoint.connectionId.getDecryptedApiKey();
    const apiSecret = await customEndpoint.connectionId.getDecryptedApiSecret();

    // Create client and execute
    const client = new ERPNextClient({
      baseUrl: customEndpoint.connectionId.baseUrl,
      apiKey,
      apiSecret
    });

    const result = await client.sendRaw({
      method: customEndpoint.method,
      path: customEndpoint.path,
      query: query || {},
      body: body || {}
    });

    res.json({
      ok: true,
      data: {
        ...result,
        customEndpointId: customEndpoint._id,
        customEndpointLabel: customEndpoint.label,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error executing custom endpoint:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /custom/:id/usage
 * Get usage statistics for a custom endpoint
 */
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const customEndpoint = await CustomEndpoint.findById(id);
    if (!customEndpoint) {
      return res.status(404).json({
        ok: false,
        message: 'Custom endpoint not found'
      });
    }

    const usageStats = await customEndpoint.getUsageStats(parseInt(days));

    res.json({
      ok: true,
      data: {
        ...usageStats,
        customEndpoint: {
          _id: customEndpoint._id,
          label: customEndpoint.label,
          method: customEndpoint.method,
          path: customEndpoint.path
        },
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * POST /custom/:id/test
 * Test a custom endpoint without saving to history
 */
router.post('/:id/test', async (req, res) => {
  try {
    const { id } = req.params;
    const { query, body } = req.body; // Optional query and body overrides

    const customEndpoint = await CustomEndpoint.findById(id)
      .populate('connectionId');
    
    if (!customEndpoint) {
      return res.status(404).json({
        ok: false,
        message: 'Custom endpoint not found'
      });
    }

    // Import ERPNextClient and execute the request
    const ERPNextClient = (await import('../erpnext/ERPNextClient.js')).default;
    
    // Decrypt connection secrets
    const apiKey = await customEndpoint.connectionId.getDecryptedApiKey();
    const apiSecret = await customEndpoint.connectionId.getDecryptedApiSecret();

    // Create client and execute
    const client = new ERPNextClient({
      baseUrl: customEndpoint.connectionId.baseUrl,
      apiKey,
      apiSecret
    });

    const result = await client.sendRaw({
      method: customEndpoint.method,
      path: customEndpoint.path,
      query: query || {},
      body: body || {}
    });

    res.json({
      ok: true,
      data: {
        ...result,
        customEndpoint: {
          _id: customEndpoint._id,
          label: customEndpoint.label,
          method: customEndpoint.method,
          path: customEndpoint.path
        },
        testMode: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error testing custom endpoint:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

export default router;
