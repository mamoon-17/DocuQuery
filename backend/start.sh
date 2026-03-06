#!/bin/bash
set -e

# Start Chroma server in background
echo "Starting Chroma server..."
chroma run --host 0.0.0.0 --port 8000 --path /data &
CHROMA_PID=$!

# Wait a moment for Chroma to start
sleep 2

# Production start: run the compiled JS
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting backend in production mode"
  exec node dist/server.js
else
  echo "Starting backend in development mode"
  exec npm run dev
fi

# If backend exits, kill Chroma
kill $CHROMA_PID 2>/dev/null || true
