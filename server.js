import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers
import generateSampleHandler from './api/generate-sample.js';
import generateReportHandler from './api/generate-report.js';
import checkoutWebhookHandler from './api/checkout-webhook.js';
import dashboardHandler from './api/dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());

// Serve landing page for root
app.get('/', (req, res) => {
  const landingPath = path.join(__dirname, 'landing/landing.html');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(landingPath);
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
app.listen(PORT, () => {
  console.log(`ReviewIntel server running on port ${PORT}`);
});

export default app;
