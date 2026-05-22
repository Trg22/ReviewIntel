
import express from 'express';
import { LANDING_HTML } from './landing-template.js';
import generateSampleHandler from './api/generate-sample.js';
import generateReportHandler from './api/generate-report.js';
import checkoutWebhookHandler from './api/checkout-webhook.js';
import dashboardHandler from './api/dashboard.js';

console.log('1. All imports done');

const app = express();
console.log('2. Express app created');

app.use(express.json());
console.log('3. Middleware added');

app.get('/', (req, res) => {
  res.send('Test');
});
console.log('4. Routes added');

app.post('/api/generate-sample', generateSampleHandler);
app.post('/api/generate-report', generateReportHandler);
app.post('/api/checkout-webhook', checkoutWebhookHandler);
app.get('/api/dashboard/:userId', dashboardHandler);
console.log('5. API handlers added');

const PORT = 3000;
console.log(`6. About to listen on port ${PORT}`);

app.listen(PORT, () => {
  console.log(`7. SERVER RUNNING on port ${PORT}`);
});

console.log('8. listen() called (async mode)');
