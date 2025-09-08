import express from 'express';
import { History, Connection } from '../models/index.js';

const router = express.Router();

/**
 * GET /history
 * List history with pagination and filtering
 */
router.get('/', async (req, res) => {
  try {
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

    res.json({
      ok: true,
      data: history,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(pageSize))
      },
      statistics
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /history/stats/:connectionId
 * Get statistics for a specific connection
 */
router.get('/stats/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { days = 30 } = req.query;

    // Validate connection exists
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
    }

    const stats = await History.getStats(connectionId, parseInt(days));

    res.json({
      ok: true,
      data: {
        ...stats,
        connectionId,
        connectionName: connection.name,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /history/:id
 * Get a single history entry
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const historyEntry = await History.findById(id)
      .populate('connectionId', 'name baseUrl');

    if (!historyEntry) {
      return res.status(404).json({
        ok: false,
        message: 'History entry not found'
      });
    }

    res.json({
      ok: true,
      data: historyEntry
    });
  } catch (error) {
    console.error('Error fetching history entry:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * DELETE /history/:id
 * Delete a history entry
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const historyEntry = await History.findByIdAndDelete(id);
    if (!historyEntry) {
      return res.status(404).json({
        ok: false,
        message: 'History entry not found'
      });
    }

    res.json({
      ok: true,
      message: 'History entry deleted successfully',
      data: {
        _id: historyEntry._id,
        method: historyEntry.request.method,
        path: historyEntry.request.path,
        createdAt: historyEntry.createdAt
      }
    });
  } catch (error) {
    console.error('Error deleting history entry:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * DELETE /history
 * Bulk delete history entries
 */
router.delete('/', async (req, res) => {
  try {
    const { connectionId, olderThan, method, status } = req.body;

    // Build query for bulk delete
    const query = {};
    if (connectionId) query.connectionId = connectionId;
    if (method) query['request.method'] = method.toUpperCase();
    if (status) query['response.status'] = parseInt(status);
    if (olderThan) query.createdAt = { $lt: new Date(olderThan) };

    const result = await History.deleteMany(query);

    res.json({
      ok: true,
      message: `${result.deletedCount} history entries deleted successfully`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error bulk deleting history:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /history/export/:connectionId
 * Export history for a connection (CSV format)
 */
router.get('/export/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { limit = 1000, format = 'json' } = req.query;

    // Validate connection exists
    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
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
      res.json({
        ok: true,
        data: history,
        connection: {
          _id: connection._id,
          name: connection.name,
          baseUrl: connection.baseUrl
        },
        exportInfo: {
          count: history.length,
          exportedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error exporting history:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

export default router;

