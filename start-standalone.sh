#!/bin/bash
# ReviewIntels Standalone Launcher
# This script can be deployed anywhere and will start the service

set -e

echo "🚀 ReviewIntels Launcher"
echo "======================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found - installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check npm
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Setup environment
export NODE_ENV=production
export PORT=${PORT:-3000}

# Show startup info
echo ""
echo "✅ ReviewIntels Ready to Start"
echo ""
echo "Configuration:"
echo "  - Port: $PORT"
echo "  - Environment: $NODE_ENV"
echo "  - Node version: $(node --version)"
echo ""

# Start service
echo "🎯 Starting ReviewIntels..."
npm start
