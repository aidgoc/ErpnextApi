import express from 'express';
import { History, Connection } from '../models/index.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse,
  asyncHandler 
} from '../utils/response.js';

const router = express.Router();

/**
 * GET /history
 * List history with pagination and filtering
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    connectionId, 
    page = 1, 
    pageSize = 20, 
    method, 
    path, 
    docType,
    status,
    search,
    startDate,
    endDate
  } = req.query;

  // Build query
  const query = {};
  
  if (connectionId) query.connectionId = connectionId;
  if (method) query['request.method'] = method.toUpperCase();
  if (docType) query['request.docType'] = docType;
  if (status) query['response.status'] = parseInt(status);

  // Date range filtering
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search functionality
  if (search) {
    query.$or = [
      { 'request.path': { $regex: search, $options: 'i' } },
      { 'request.method': { $regex: search, $options: 'i' } },
      { 'request.docType': { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(pageSize);

  // Execute query
  const history = await History.find(query)
    .populate('connectionId', 'name baseUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(pageSize));

  // Get total count for pagination
  const totalCount = await History.countDocuments(query);

  // Calculate statistics
  const stats = await History.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        successfulRequests: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$response.status', 200] }, { $lt: ['$response.status', 300] }] },
              1,
              0
            ]
          }
        },
        errorRequests: {
          $sum: {
            $cond: [{ $gte: ['$response.status', 400] }, 1, 0]
          }
        },
        avgDuration: { $avg: '$durationMs' },
        minDuration: { $min: '$durationMs' },
        maxDuration: { $max: '$durationMs' }
      }
    }
  ]);

  const statistics = stats[0] || {
    totalRequests: 0,
    successfulRequests: 0,
    errorRequests: 0,
    avgDuration: 0,
    minDuration: 0,
    maxDuration: 0
  };

  const response = successResponse({
    history,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total: totalCount,
      pages: Math.ceil(totalCount / parseInt(pageSize))
    },
    statistics
  }, 'History retrieved successfully');
  
  res.status(response.status).json(response.json);
}));

/**
 * GET /history/stats/:connectionId
 * Get statistics for a specific connection
 */
router.get('/stats/:connectionId', asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const { days = 30 } = req.query;

  // Validate connection exists
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    const response = notFoundResponse('Connection');
    return res.status(response.status).json(response.json);
  }

  const stats = await History.getStats(connectionId, parseInt(days));

  const response = successResponse({
    ...stats,
    connectionId,
    connectionName: connection.name,
    period: `${days} days`
  }, 'History statistics retrieved');
  
  res.status(response.status).json(response.json);
}));

/**
 * GET /history/:id
 * Get a single history entry
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const historyEntry = await History.findById(id)
    .populate('connectionId', 'name baseUrl');

  if (!historyEntry) {
    const response = notFoundResponse('History entry');
    return res.status(response.status).json(response.json);
  }

  const response = successResponse(historyEntry, 'History entry retrieved');
  res.status(response.status).json(response.json);
}));

/**
 * DELETE /history/:id
 * Delete a history entry
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const historyEntry = await History.findByIdAndDelete(id);
  if (!historyEntry) {
    const response = notFoundResponse('History entry');
    return res.status(response.status).json(response.json);
  }

  const response = successResponse({
    _id: historyEntry._id,
    method: historyEntry.request.method,
    path: historyEntry.request.path,
    createdAt: historyEntry.createdAt
  }, 'History entry deleted successfully');
  
  res.status(response.status).json(response.json);
}));

/**
 * DELETE /history
 * Bulk delete history entries
 */
router.delete('/', asyncHandler(async (req, res) => {
  const { connectionId, olderThan, method, status } = req.body;

  // Build query for bulk delete
  const query = {};
  if (connectionId) query.connectionId = connectionId;
  if (method) query['request.method'] = method.toUpperCase();
  if (status) query['response.status'] = parseInt(status);
  if (olderThan) query.createdAt = { $lt: new Date(olderThan) };

  const result = await History.deleteMany(query);

  const response = successResponse({
    deletedCount: result.deletedCount
  }, `${result.deletedCount} history entries deleted successfully`);
  
  res.status(response.status).json(response.json);
}));

/**
 * GET /history/export/:connectionId
 * Export history for a connection (CSV format)
 */
router.get('/export/:connectionId', asyncHandler(async (req, res) => {
  const { connectionId } = req.params;
  const { limit = 1000, format = 'json' } = req.query;

  // Validate connection exists
  const connection = await Connection.findById(connectionId);
  if (!connection) {
    const response = notFoundResponse('Connection');
    return res.status(response.status).json(response.json);
  }

  const history = await History.find({ connectionId })
    .populate('connectionId', 'name baseUrl')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeader = 'Date,Method,Path,Status,Duration(ms),DocType\n';
    const csvRows = history.map(entry => {
      const date = entry.createdAt.toISOString();
      const method = entry.request.method;
      const path = entry.request.path;
      const status = entry.response.status;
      const duration = entry.durationMs;
      const docType = entry.request.docType || '';
      
      return `${date},${method},${path},${status},${duration},${docType}`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="history-${connectionId}.csv"`);
    res.send(csvHeader + csvRows);
  } else {
    // Return JSON format
    const response = successResponse({
      history,
      connection: {
        _id: connection._id,
        name: connection.name,
        baseUrl: connection.baseUrl
      },
      exportInfo: {
        count: history.length,
        exportedAt: new Date().toISOString()
      }
    }, 'History exported successfully');
    
    res.status(response.status).json(response.json);
  }
}));

export default router;

