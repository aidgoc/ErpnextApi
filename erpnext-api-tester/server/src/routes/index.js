import express from 'express';

// Import sub-routers
import connectionsRouter from './connections.js';
import erpRouter from './erp.js';
import savedRouter from './saved.js';
import historyRouter from './history.js';
import customRouter from './custom.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'ERPNext API Tester Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    ok: true,
    message: 'API routes are working correctly',
    timestamp: new Date().toISOString()
  });
});

// Encryption test endpoint
router.post('/crypto/test', async (req, res) => {
  try {
    const { encryptSecret, decryptSecret } = await import('../utils/crypto.js');
    const { ENCRYPTION_KEY_BASE64 } = await import('../utils/env.js');
    
    const testMessage = req.body.message || 'Hello, World!';
    
    // Encrypt the message
    const encrypted = encryptSecret(testMessage, ENCRYPTION_KEY_BASE64);
    
    // Decrypt the message
    const decrypted = decryptSecret(encrypted, ENCRYPTION_KEY_BASE64);
    
    res.json({
      ok: true,
      original: testMessage,
      encrypted,
      decrypted,
      success: testMessage === decrypted
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Crypto test failed',
      error: error.message
    });
  }
});

// Mount sub-routers
router.use('/connections', connectionsRouter);
router.use('/erp', erpRouter);
router.use('/saved', savedRouter);
router.use('/history', historyRouter);
router.use('/custom', customRouter);

export default router;
