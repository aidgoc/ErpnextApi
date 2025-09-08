import express from 'express';
import { Connection, History } from '../models/index.js';
import ERPNextClient from '../erpnext/ERPNextClient.js';

const router = express.Router();

/**
 * Middleware to load connection and create ERPNextClient
 */
async function loadConnectionAndClient(req, res, next) {
  try {
    const connectionId = req.query.connectionId || req.body.connectionId;
    
    if (!connectionId) {
      return res.status(400).json({
        ok: false,
        message: 'connectionId is required in query or body'
      });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return res.status(404).json({
        ok: false,
        message: 'Connection not found'
      });
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
  } catch (error) {
    console.error('Error loading connection:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to load connection: ' + error.message
    });
  }
}

/**
 * GET /erp/doctypes
 * Get list of DocTypes from ERPNext
 */
router.get('/doctypes', loadConnectionAndClient, async (req, res) => {
  try {
    const { limit = 2000 } = req.query;
    const docTypes = await req.erpClient.listDocTypes(parseInt(limit));

    res.json({
      ok: true,
      data: {
        docTypes,
        count: docTypes.length,
        connectionId: req.connection._id,
        connectionName: req.connection.name
      }
    });
  } catch (error) {
    console.error('Error fetching DocTypes:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * POST /erp/send
 * Send raw request to ERPNext and save to history
 */
router.post('/send', loadConnectionAndClient, async (req, res) => {
  try {
    const { method, path, query, body } = req.body;

    // Validate required fields
    if (!method || !path) {
      return res.status(400).json({
        ok: false,
        message: 'method and path are required'
      });
    }

    // Send request to ERPNext
    const startTime = Date.now();
    const result = await req.erpClient.sendRaw({ method, path, query, body });
    const durationMs = Date.now() - startTime;

    // Save to history
    try {
      await History.createEntry({
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
      });
    } catch (historyError) {
      console.error('Error saving to history:', historyError);
      // Don't fail the request if history saving fails
    }

    res.json({
      ok: true,
      data: {
        ...result,
        connectionId: req.connection._id,
        connectionName: req.connection.name,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending ERPNext request:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /erp/ping
 * Test connection to ERPNext
 */
router.get('/ping', loadConnectionAndClient, async (req, res) => {
  try {
    const pingResult = await req.erpClient.ping();

    res.json({
      ok: true,
      data: {
        ping: pingResult,
        connectionId: req.connection._id,
        connectionName: req.connection.name,
        baseUrl: req.connection.baseUrl,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error pinging ERPNext:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * GET /erp/info
 * Get ERPNext instance information
 */
router.get('/info', loadConnectionAndClient, async (req, res) => {
  try {
    const instanceInfo = await req.erpClient.getInstanceInfo();

    res.json({
      ok: true,
      data: {
        ...instanceInfo,
        connectionId: req.connection._id,
        connectionName: req.connection.name
      }
    });
  } catch (error) {
    console.error('Error getting ERPNext info:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

/**
 * POST /erp/test-connection
 * Comprehensive connection test
 */
router.post('/test-connection', loadConnectionAndClient, async (req, res) => {
  try {
    const testResult = await req.erpClient.testConnection();

    res.json({
      ok: true,
      data: {
        ...testResult,
        connectionId: req.connection._id,
        connectionName: req.connection.name
      }
    });
  } catch (error) {
    console.error('Error testing ERPNext connection:', error);
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

export default router;
