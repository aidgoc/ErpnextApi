import express from 'express';

// Import sub-routers
import connectionsRouter from './connections.js';
import erpRouter from './erp.js';
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


// Mount sub-routers
router.use('/connections', connectionsRouter);
router.use('/erp', erpRouter);
router.use('/history', historyRouter);
router.use('/custom', customRouter);

export default router;
