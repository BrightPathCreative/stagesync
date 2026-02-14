#!/bin/bash
# StageSync local server - run this to view the site in your browser

cd "$(dirname "$0")"

# Kill any existing Python server on 8080 or 5000
for port in 8080 5000; do
  pid=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Stopping existing server on port $port (PID $pid)..."
    kill $pid 2>/dev/null
    sleep 2
  fi
done

PORT=8080
echo ""
echo "Starting server at http://localhost:$PORT"
echo "Open this URL in your browser: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

python3 -m http.server $PORT
