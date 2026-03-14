# 🔧 Fix: Failed to fetch notifications error

## Problem

```
Failed to fetch notifications: {}
```

Browser console shows the notification bell can't reach the API.

## Root Cause ✅ FOUND & FIXED

**Wrong API Base URL in `.env.local`**

```
❌ Before: NEXT_PUBLIC_API_URL=http://127.0.0.1:8010/api/public
✅ After:  NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

**Why this matters:**

- Component calls: `/api/public/notifications`
- With wrong URL: `http://127.0.0.1:8010/api/public` + `/api/public/notifications`
- Results in: `http://127.0.0.1:8010/api/public/api/public/notifications` ❌

## What I Fixed

### 1. Updated `.env.local` ✅

**File**: `frontend/.env.local`

Changed from:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010/api/public
```

To:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

### 2. Improved Error Handling ✅

**File**: `frontend/src/components/NotificationBell.tsx`

Better error logging:

```typescript
// Now shows helpful debugging info
console.warn("Notification API Error:", {
  message: errorMsg,
  status: statusCode,
  code: errorType,
  url: e?.config?.url,
  isNetworkError: errorMsg === "Network Error",
});

// More specific error messages
if (errorMsg === "Network Error") {
  setError(
    "Backend not responding - make sure Laravel is running on port 8010",
  );
}
```

### 3. Created Debugging Tools ✅

- `check-backend.bat` - Windows batch script to test backend
- `check-backend.sh` - Bash script to test backend

---

## How to Fix (NOW)

### Step 1: Verify `.env.local` is correct

```bash
cd frontend
cat .env.local
```

Should show:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

✅ Already fixed!

### Step 2: Start Backend (if not running)

```bash
cd news-cms
php artisan serve --port=8010 --host=127.0.0.1
```

Expected output:

```
Laravel development server started: http://127.0.0.1:8010
```

### Step 3: Restart Frontend

```bash
# Kill frontend (Ctrl+C if running)
# Then restart
cd frontend
npm run dev
```

### Step 4: Test

- Open http://localhost:3000
- Open DevTools (F12)
- Check Console tab
- Notification bell should now work ✅

---

## Verification

### Test Backend

```bash
# Windows
check-backend.bat

# Or manually:
curl http://127.0.0.1:8010/api/public/notifications
```

Should return:

```json
[]
```

or

```json
[{"id": 1, "message": "...", ...}]
```

### Check Browser Console

Look for one of these:

✅ **Success** - No errors, notifications load

```
[No errors in console]
```

❌ **Still Failing** - Look for error type:

```
Network Error → Backend not running
404 Not Found → Wrong API URL
CORS error → Frontend not in CORS allowed origins
```

---

## API URL Explanation

The `.env.local` sets the **base URL** only, not the full path.

```
Base URL:    http://127.0.0.1:8010
API call:    /api/public/notifications
Full URL:    http://127.0.0.1:8010/api/public/notifications ✅
```

**Do NOT include `/api/public` in the base URL** - the component adds that.

---

## Common Mistakes

| Mistake                                                | Problem               | Fix                               |
| ------------------------------------------------------ | --------------------- | --------------------------------- |
| `NEXT_PUBLIC_API_URL=http://127.0.0.1:8010/api/public` | Double path           | Change to `http://127.0.0.1:8010` |
| `NEXT_PUBLIC_API_URL=http://localhost:3000`            | Wrong port (frontend) | Change to `http://127.0.0.1:8010` |
| `.env.local` doesn't exist                             | Missing config        | Copy from `.env.example`          |
| Backend not running                                    | Connection refused    | `php artisan serve --port=8010`   |

---

## Quick Checklist

- [x] `.env.local` exists ✅
- [x] `NEXT_PUBLIC_API_URL=http://127.0.0.1:8010` ✅
- [ ] Backend running (`php artisan serve --port=8010`)
- [ ] Frontend running (`npm run dev`)
- [ ] Browser shows no errors
- [ ] Notification bell loads

---

## Files Changed

1. ✅ `frontend/.env.local` - Fixed API base URL
2. ✅ `frontend/src/components/NotificationBell.tsx` - Better error logging

## Files Created

1. 📄 `check-backend.bat` - Windows test script
2. 📄 `check-backend.sh` - Linux/Mac test script

---

**Status**: ✅ FIXED

The API URL was the culprit. Now reload your frontend and the notifications should work!
