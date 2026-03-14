# 🔧 Network Error Fix - NotificationBell Component

## Problem

```
Network Error at api.get('/api/public/notifications')
```

## Root Causes (in order of likelihood)

### 1. Backend Server Not Running ❌

```bash
# Check if Laravel server is running on port 8010
curl http://127.0.0.1:8010/api/public/notifications
```

### 2. CORS Origin Mismatch ⚠️

Frontend is running on a different origin than configured in `config/cors.php`

### 3. API Base URL Wrong 🔀

Frontend `baseURL` in `lib/axios.ts` doesn't match backend URL

---

## Solution Checklist

### Step 1: Start Backend (if not running)

```bash
cd news-cms
php artisan serve --port=8010 --host=127.0.0.1
```

Expected output:

```
Laravel development server started: http://127.0.0.1:8010
```

### Step 2: Verify Frontend URL

Check `frontend/src/lib/axios.ts`:

```typescript
baseURL: "http://127.0.0.1:8010"; // ✅ Correct
```

If frontend runs on different port, update CORS in `config/cors.php`:

```php
'allowed_origins' => [
    'http://localhost:YOUR_PORT',
    'http://127.0.0.1:YOUR_PORT',
],
```

### Step 3: Test Endpoint Directly

```bash
# Terminal
curl -X GET http://127.0.0.1:8010/api/public/notifications

# Should return JSON (even if empty)
# If 404: endpoint doesn't exist
# If Network Error: backend not running
```

### Step 4: Check Browser Console

- Open DevTools (F12)
- Go to Network tab
- Trigger the error
- Look at the request details:
  - URL should be: `http://127.0.0.1:8010/api/public/notifications`
  - Status should be: 200 (not Network Error)

### Step 5: Browser Cache & CORS

```javascript
// In browser console
const api = await fetch("http://127.0.0.1:8010/api/public/notifications");
console.log(api.status);
```

---

## Common Scenarios

### Scenario A: Backend port changed

❌ Frontend still calls old port
✅ Update `baseURL` in axios config

### Scenario B: Running multiple Laravel apps

❌ Different ports for different projects
✅ Make sure you're running on port 8010

### Scenario C: Firewall/Network issue

❌ Port 8010 blocked
✅ Try `localhost` instead of `127.0.0.1`

### Scenario D: Node.js fetch blocked

❌ Some environments block localhost calls
✅ Use `http://127.0.0.1:8010` (explicit IP)

---

## Debug Mode

Add logging to `NotificationBell.tsx`:

```typescript
const fetchNotifications = async () => {
  try {
    console.log(
      "Fetching from:",
      "http://127.0.0.1:8010/api/public/notifications",
    );
    const res = await api.get("/api/public/notifications");
    console.log("Success:", res.data);
    setNotifications(res.data);
  } catch (e: any) {
    console.error("Error details:", {
      message: e.message,
      code: e.code,
      status: e.response?.status,
      url: e.config?.url,
    });
  }
};
```

---

## Quick Fix (99% works)

### Terminal 1: Start Backend

```bash
cd news-cms
php artisan serve --port=8010
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

### Then test:

```bash
# In another terminal or curl
curl http://127.0.0.1:8010/api/public/notifications
```

If successful, restart frontend browser tab and test again.

---

## If Still Not Working

Check these files in order:

1. `news-cms/.env` - `APP_URL=http://127.0.0.1:8010`
2. `news-cms/config/app.php` - `'url' => env('APP_URL')`
3. `news-cms/config/cors.php` - Frontend origin listed
4. `news-cms/routes/api.php` - Route exists (line 75)
5. `news-cms/app/Http/Controllers/Api/Public/NotificationController.php` - Controller exists

---

## Network Error vs Other Errors

| Error         | Cause               | Fix                    |
| ------------- | ------------------- | ---------------------- |
| Network Error | Backend not running | Start PHP server       |
| 404 Not Found | Route doesn't exist | Check routes/api.php   |
| 403 Forbidden | Auth required       | Check middleware       |
| 500 Internal  | Code error          | Check Laravel logs     |
| CORS blocked  | Origin mismatch     | Update config/cors.php |

---

**Status**: Ready to debug

**Test Command**:

```bash
php artisan serve --port=8010 &
sleep 2
curl -v http://127.0.0.1:8010/api/public/notifications
```
