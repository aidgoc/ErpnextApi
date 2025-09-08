import express from 'express';
import { SavedRequest, Connection } from '../models/index.js';

const router = express.Router();

/**
 * POST /saved
 * Create a new saved request
 */
router.post('/', async (req, res) => {
  try {
    const { name, connectionId, method, docType, path, query, body } = req.body;

    // Validate required fields
    if (!name || !connectionId || !method || !path) {
      return res.status(400).json({
        ok: false,
        message: 'name, connectionId, method, and path are required'
      });
    }

    // Validate connection exists
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
    }

    // Create saved request
    const savedRequest = await SavedRequest.createRequest({
      name,
      connectionId,
      method,
      docType,
      path,
      query,
      body
    });

    // Populate connection info
    await savedRequest.populate('connectionId', 'name baseUrl');

    res.status(201).json({
      ok: true,
      data: savedRequest,
      message: 'Saved request created successfully'
    });
  } catch (error) {
    console.error('Error creating saved request:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /saved
 * List saved requests (filter by connectionId optional)
 */
router.get('/', async (req, res) => {
  try {
    const { connectionId, method, docType, limit = 50, page = 1 } = req.query;

    // Build query
    const query = {};
    if (connectionId) query.connectionId = connectionId;
    if (method) query.method = method.toUpperCase();
    if (docType) query.docType = docType;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const savedRequests = await SavedRequest.find(query)
      .populate('connectionId', 'name baseUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await SavedRequest.countDocuments(query);

    res.json({
      ok: true,
      data: savedRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching saved requests:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /saved/:id
 * Get a single saved request
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const savedRequest = await SavedRequest.findById(id)
      .populate('connectionId', 'name baseUrl');

    if (!savedRequest) {
      return res.status(404).json({
        ok: false,
        message: 'Saved request not found'
      });
    }

    res.json({
      ok: true,
      data: savedRequest
    });
  } catch (error) {
    console.error('Error fetching saved request:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * PATCH /saved/:id
 * Update a saved request
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, method, docType, path, query, body } = req.body;

    const savedRequest = await SavedRequest.findById(id);
    if (!savedRequest) {
      return res.status(404).json({
        ok: false,
        message: 'Saved request not found'
      });
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (method) updateData.method = method.toUpperCase();
    if (docType !== undefined) updateData.docType = docType;
    if (path) updateData.path = path;
    if (query !== undefined) updateData.query = query;
    if (body !== undefined) updateData.body = body;

    const updatedRequest = await SavedRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('connectionId', 'name baseUrl');

    res.json({
      ok: true,
      data: updatedRequest,
      message: 'Saved request updated successfully'
    });
  } catch (error) {
    console.error('Error updating saved request:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * DELETE /saved/:id
 * Delete a saved request
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const savedRequest = await SavedRequest.findByIdAndDelete(id);
    if (!savedRequest) {
      return res.status(404).json({
        ok: false,
        message: 'Saved request not found'
      });
    }

    res.json({
      ok: true,
      message: 'Saved request deleted successfully',
      data: {
        _id: savedRequest._id,
        name: savedRequest.name
      }
    });
  } catch (error) {
    console.error('Error deleting saved request:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * POST /saved/:id/execute
 * Execute a saved request
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;

    const savedRequest = await SavedRequest.findById(id)
      .populate('connectionId');
    
    if (!savedRequest) {
      return res.status(404).json({
        ok: false,
        message: 'Saved request not found'
      });
    }

    // Import ERPNextClient and execute the request
    const ERPNextClient = (await import('../erpnext/ERPNextClient.js')).default;
    
    // Decrypt connection secrets
    const apiKey = await savedRequest.connectionId.getDecryptedApiKey();
    const apiSecret = await savedRequest.connectionId.getDecryptedApiSecret();

    // Create client and execute
    const client = new ERPNextClient({
      baseUrl: savedRequest.connectionId.baseUrl,
      apiKey,
      apiSecret
    });

    const result = await client.sendRaw({
      method: savedRequest.method,
      path: savedRequest.path,
      query: savedRequest.query,
      body: savedRequest.body
    });

    res.json({
      ok: true,
      data: {
        ...result,
        savedRequestId: savedRequest._id,
        savedRequestName: savedRequest.name,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error executing saved request:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

export default router;
