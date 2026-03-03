#!/bin/bash
set -e
echo "🔧 Setting up AI Health Scanner Frontend..."
cd "$(dirname "$0")/frontend"
echo "📦 Installing npm packages..."
npm install
echo ""
echo "🚀 Frontend running at http://localhost:3000"
echo ""
npm start
