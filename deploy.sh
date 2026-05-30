#!/bin/bash
set -e

echo "Starting ReviewIntels deployment..."

# Stop any local instances
pkill -f "node server.js" || true
sleep 2

# Ensure fresh node_modules
rm -rf node_modules package-lock.json
npm ci

# Start server
echo "Starting server on port 3000..."
export NODE_ENV=production
export PORT=3000
node server.js &
SERVER_PID=$!

sleep 3

# Test
echo "Testing server..."
curl -s http://localhost:3000/api/health || echo "Health check failed"

echo "Server running with PID $SERVER_PID"
wait $SERVER_PID
