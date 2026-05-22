import express from 'express';
import { LANDING_HTML } from './landing-template.js';

// Import API handlers
import generateSampleHandler from './api/generate-sample.js';
import generateReportHandler from './api/generate-report.js';
import checkoutWebhookHandler from './api/checkout-webhook.js';
import dashboardHandler from './api/dashboard.js';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve landing page for root
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(LANDING_HTML);
});

// API Routes
app.post('/api/generate-sample', generateSampleHandler);
app.post('/api/generate-report', generateReportHandler);
app.post('/api/checkout-webhook', checkoutWebhookHandler);
app.get('/api/dashboard/:userId', dashboardHandler);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`ReviewIntel server running on ${HOST}:${PORT}`);
});

export default app;
