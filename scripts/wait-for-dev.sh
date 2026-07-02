#!/bin/bash

# Script to wait for dev server to be fully ready
# Waits for HTTP 200 response from localhost

PORT=${1:-3000}
MAX_ATTEMPTS=30
ATTEMPT=0

echo "🔄 Waiting for dev server on localhost:$PORT..."

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null)

  if [ "$STATUS" = "200" ] || [ "$STATUS" = "307" ]; then
    echo "✅ Server is ready (HTTP $STATUS)"
    exit 0
  fi

  ATTEMPT=$((ATTEMPT + 1))
  echo "⏳ Attempt $ATTEMPT/$MAX_ATTEMPTS - Status: $STATUS"
  sleep 1
done

echo "❌ Server did not respond after ${MAX_ATTEMPTS} seconds"
exit 1
