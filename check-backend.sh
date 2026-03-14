#!/bin/bash

# Check if backend is running
echo "🔍 Checking if Laravel backend is running on port 8010..."

if curl -s http://127.0.0.1:8010/api/public/notifications > /dev/null 2>&1; then
    echo "✅ Backend is responding!"
    echo ""
    echo "Testing endpoint:"
    curl -s http://127.0.0.1:8010/api/public/notifications | jq . 2>/dev/null || curl -s http://127.0.0.1:8010/api/public/notifications
else
    echo "❌ Backend is NOT responding on http://127.0.0.1:8010"
    echo ""
    echo "To start the backend, run:"
    echo "  cd news-cms"
    echo "  php artisan serve --port=8010 --host=127.0.0.1"
fi
