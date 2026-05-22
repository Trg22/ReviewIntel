// Vercel serverless function - must be CommonJS
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // Serve landing page HTML
  if (req.url === '/' || req.url === '') {
    // Read HTML file
    const htmlPath = path.join(__dirname, '..', 'landing-template.html');
    
    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    // Fallback: return simple HTML
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ReviewIntel - Amazon Review Analysis</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>ReviewIntel MVP</h1>
        <p>Landing page loading...</p>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(fallbackHtml);
  }

  // 404
  res.status(404).json({ error: 'Not found' });
};
