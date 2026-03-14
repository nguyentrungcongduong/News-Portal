#!/bin/bash

# 🔧 Network Error Diagnostic Script
# Run this to diagnose the NotificationBell network error

echo "🔍 Diagnosing NotificationBell Network Error..."
echo ""

# Check 1: Is backend running?
echo "1️⃣ Checking if backend is running on port 8010..."
if curl -s http://127.0.0.1:8010/api/public/notifications > /dev/null 2>&1; then
    echo "✅ Backend is running!"
    
    # Check 2: Can we reach the endpoint?
    echo ""
    echo "2️⃣ Testing /api/public/notifications endpoint..."
    RESPONSE=$(curl -s -w "\n%{http_code}" http://127.0.0.1:8010/api/public/notifications)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Endpoint is working!"
    else
        echo "❌ Endpoint returned status $HTTP_CODE"
    fi
else
    echo "❌ Backend is NOT running on port 8010!"
    echo ""
    echo "🚀 To fix, run in terminal:"
    echo "   cd news-cms"
    echo "   php artisan serve --port=8010 --host=127.0.0.1"
fi

echo ""
echo "3️⃣ Checking CORS configuration..."
grep -A 5 "allowed_origins" news-cms/config/cors.php | head -10

echo ""
echo "4️⃣ Checking frontend axios config..."
grep "baseURL" frontend/src/lib/axios.ts

echo ""
echo "5️⃣ Checking if route exists in api.php..."
grep -n "notifications" news-cms/routes/api.php | grep "public"

echo ""
echo "✅ Diagnostic complete!"
