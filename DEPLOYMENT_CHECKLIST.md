# URGENT - Environment Variables to Set on Render/Vercel

## Issue Summary
Admin UI is connecting to wrong URL for sockets + CORS blocking requests

## Changes Made
1. ✅ Fixed admin UI socket URL fallback (pointing to socket service now)
2. ✅ Updated socket server CORS to include Vercel domains
3. ✅ Updated Laravel CORS defaults

## Environment Variables to Set

### 1. Socket Server (news-portal-socket on Render)
```
FRONTEND_URL=https://news-portal-admin-beta.vercel.app,https://news-portal-web.vercel.app
```

### 2. Web Service (news-portal-laravel on Render)
```
CORS_ALLOWED_ORIGINS=https://news-portal-web.vercel.app,https://news-portal-admin-beta.vercel.app,https://news-portal-public-gray.vercel.app
SOCKET_SERVER_URL=https://news-portal-socket.onrender.com
```

### 3. Admin UI (news-portal-admin on Vercel)
```
VITE_SOCKET_URL=https://news-portal-socket.onrender.com
VITE_API_URL=https://news-portal-api-qh1p.onrender.com
```

### 4. Frontend (news-portal-web on Vercel)
```
NEXT_PUBLIC_SOCKET_URL=https://news-portal-socket.onrender.com
```

## Deployment Steps

1. Set environment variables on Render (Socket Service)
2. Set environment variables on Render (Web Service) 
3. Set environment variables on Vercel (Admin UI)
4. Set environment variables on Vercel (Frontend)
5. Deploy all services (they auto-deploy on git push)

## Verify Fix

After deployment, check browser console:
- ❌ No more CORS errors
- ❌ No more "127.0.0.1:3001" errors
- ✅ "Connected to socket server" message
- ✅ API requests working (200 status)
