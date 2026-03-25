# WebSocket Configuration Update

## Changes Made

### 1. Frontend (RealtimeListener.tsx)
- Changed hardcoded `http://127.0.0.1:3001` to use environment variable
- Uses `process.env.NEXT_PUBLIC_SOCKET_URL` with fallback to localhost for development

### 2. Backend (SocketService.php)
- Updated to use `env('SOCKET_SERVER_URL')` environment variable
- Maintains backward compatibility with localhost fallback

### 3. Environment Variables

#### Frontend Environment Variables
Add to `frontend/.env` and configure on Vercel:
```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-service.onrender.com
```

#### Backend Environment Variables  
Add to `news-cms/.env` and configure on Render:
```
SOCKET_SERVER_URL=https://your-socket-service.onrender.com
```

#### Admin UI Environment Variables
Add to admin UI deployment (Vercel):
```
VITE_SOCKET_URL=https://your-socket-service.onrender.com
```

## Deployment Steps

### 1. Configure Environment Variables on Render (Socket Service)
Ensure your socket service is deployed and running at `https://news-portal-socket.onrender.com`

### 2. Configure Environment Variables on Render (Web Service)
In your news-portal-laravel service on Render, add:
```
SOCKET_SERVER_URL=https://news-portal-socket.onrender.com
```

### 3. Configure Environment Variables on Vercel (Frontend)
In your Vercel frontend project settings, add:
```
NEXT_PUBLIC_SOCKET_URL=https://news-portal-socket.onrender.com
```

### 4. Rebuild Frontend
After setting environment variables, rebuild the frontend:
```bash
cd frontend
npm install
npm run build
```

### 5. Deploy Updates
- Commit and push changes to GitHub
- Render will automatically redeploy the web service
- Vercel will automatically redeploy the frontend

## Testing

After deployment, verify:
1. Open browser developer tools (F12)
2. Check Console tab for WebSocket connection errors
3. Navigate to Network tab → WS (WebSocket) filter
4. You should see successful WebSocket connections to your Render socket service
5. No more errors about `127.0.0.1:3001`

## Files Modified

1. `frontend/src/components/RealtimeListener.tsx`
2. `news-cms/app/Services/SocketService.php`
3. `frontend/.env.example`
4. `news-cms/.env.example`
5. `news-cms/.env`

## Troubleshooting

If WebSocket errors persist:
1. Check browser console for the exact URL it's trying to connect to
2. Verify environment variables are set in deployment platforms
3. Clear browser cache and try incognito mode
4. Check if socket service is running on Render (check Render dashboard logs)
5. Ensure socket service CORS allows connections from your frontend domain
