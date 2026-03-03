#!/bin/bash
set -e
echo "🔧 Setting up AI Health Scanner Backend..."
cd "$(dirname "$0")/backend"

if [ ! -d "venv" ]; then
  echo "📦 Creating virtual environment with Python 3.11..."
  python3.11 -m venv venv 2>/dev/null || python3 -m venv venv
fi

source venv/bin/activate
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo ""
echo "🚀 Backend running at http://localhost:8000"
echo "📚 API docs at http://localhost:8000/docs"
echo ""
venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000
