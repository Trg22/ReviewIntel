import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers
import generateSampleHandler from './generate-sample.js';
import generateReportHandler from './generate-report.js';
import checkoutWebhookHandler from './checkout-webhook.js';
import dashboardHandler from './dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'landing')));

// API Routes
app.post('/api/generate-sample', async (req, res) => {
  await generateSampleHandler(req, res);
});

app.post('/api/generate-report', async (req, res) => {
  await generateReportHandler(req, res);
});

app.post('/api/checkout-webhook', async (req, res) => {
  await checkoutWebhookHandler(req, res);
});

app.get('/api/dashboard/:userId', async (req, res) => {
  await dashboardHandler(req, res);
});

// Serve landing page for root
app.get('/', (req, res) => {
  const landingPath = path.join(__dirname, 'landing.html');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(landingPath);
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ReviewIntel server running on port ${PORT}`);
});

export default app;
