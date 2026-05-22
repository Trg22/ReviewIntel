import express from 'express';
import { LANDING_HTML } from './landing-template.js';

const app = express();

// Middleware
app.use(express.json());

// Serve landing page for root
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(LANDING_HTML);
});

// Health check (simple endpoint with no dependencies)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Only start server in local/non-Vercel environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReviewIntel server running on port ${PORT}`);
  });
}

export default app;
