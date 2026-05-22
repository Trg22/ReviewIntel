
console.log('1. Starting');
await import('./landing-template.js');
console.log('2. Landing template imported');
await import('./api/generate-sample.js');
console.log('3. generate-sample imported');
await import('./api/generate-report.js');
console.log('4. generate-report imported');
await import('./api/checkout-webhook.js');
console.log('5. checkout-webhook imported');
await import('./api/dashboard.js');
console.log('6. dashboard imported');
console.log('7. All imports complete');
