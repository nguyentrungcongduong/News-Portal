# 🔧 Fix Network Error: NotificationBell

## Quick Fix (30 seconds)

### Problem

```
AxiosError: Network Error at api.get('/api/public/notifications')
```

### Root Cause

**Backend (Laravel) server is not running** on port 8010

### Solution

**Terminal 1: Start Backend**

```bash
cd news-cms
php artisan serve --port=8010 --host=127.0.0.1
```

Expected output:

```
Laravel development server started: http://127.0.0.1:8010
```

**Terminal 2: Start Frontend** (if not already running)

```bash
cd frontend
npm run dev
```

Expected output:

```
  ▲ Next.js 16.1.1
  - Local:        http://localhost:3000
```

**Then**: Refresh browser and error should be gone ✅

---

## Changes Made (For Your Reference)

### 1. Enhanced Axios Config

**File**: `frontend/src/lib/axios.ts`

✅ Added environment variable support
✅ Added timeout (10 seconds)
✅ Better error logging
✅ Shows helpful message if backend not running

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8010";
```

### 2. Improved NotificationBell Component

**File**: `frontend/src/components/NotificationBell.tsx`

✅ Added error state handling
✅ Loading state indicator
✅ Better error messages (user-friendly)
✅ Prevents crashes when API fails

```typescript
const [error, setError] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

### 3. Environment Template

**File**: `frontend/.env.example`

Created template for developers to copy:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

---

## Setup Instructions

### First Time Setup

1. **Create .env.local in frontend folder**:

```bash
cd frontend
cp .env.example .env.local
```

2. **Verify content** of `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

3. **Start Backend**:

```bash
cd news-cms
php artisan serve --port=8010 --host=127.0.0.1
```

4. **Start Frontend**:

```bash
cd frontend
npm run dev
```

5. **Test**:
   - Go to http://localhost:3000
   - Should see notification bell without errors

---

## Verification Checklist

- [ ] Backend running on http://127.0.0.1:8010
- [ ] Frontend running on http://localhost:3000 or http://127.0.0.1:3000
- [ ] `.env.local` exists in frontend folder
- [ ] `NEXT_PUBLIC_API_URL=http://127.0.0.1:8010` set correctly
- [ ] Browser console shows no Network Errors
- [ ] Notification bell loads without error

---

## Debugging (If Still Not Working)

### Test 1: Can you reach backend?

```bash
curl http://127.0.0.1:8010/api/public/notifications
```

If you get JSON response → ✅ Backend works
If you get "Connection refused" → ❌ Backend not running

### Test 2: Check frontend environment

```bash
cd frontend
cat .env.local
```

Should show:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

### Test 3: Check browser console

Open DevTools (F12) → Console tab

Look for:

- ✅ "Fetching from: http://127.0.0.1:8010/api/public/notifications"
- ❌ "Network Error" → Backend not running
- ❌ "Cannot reach http://127.0.0.1:8010" → Wrong URL or port

### Test 4: CORS issues

If you see CORS error in console:

1. Check `news-cms/config/cors.php`
2. Ensure your frontend URL is in `allowed_origins`:

```php
'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
],
```

---

## Common Scenarios

| Symptom                    | Cause                    | Fix                              |
| -------------------------- | ------------------------ | -------------------------------- |
| "Network Error" in console | Backend not running      | `php artisan serve --port=8010`  |
| Blank notification list    | No notifications in DB   | Create via admin panel           |
| CORS blocked error         | Frontend URL not in CORS | Update config/cors.php           |
| 404 Not Found              | Wrong endpoint           | Check routes/api.php line 75     |
| 500 Error                  | Controller error         | Check `storage/logs/laravel.log` |

---

## Port Conflicts

If port 8010 is already in use:

```bash
# Find what's using port 8010
lsof -i :8010

# Or use different port
php artisan serve --port=8011 --host=127.0.0.1

# Then update frontend .env.local:
NEXT_PUBLIC_API_URL=http://127.0.0.1:8011
```

---

## Next Steps

After fixing the network error:

1. ✅ Notification bell loads
2. ✅ Shows "No new notifications" (or actual notifications)
3. ✅ No console errors

Then you can:

- Create notifications in admin panel
- Test bell updates
- Monitor user notifications

---

## Files Modified

1. `frontend/src/lib/axios.ts` - Better error handling
2. `frontend/src/components/NotificationBell.tsx` - Graceful error UI
3. `frontend/.env.example` - Environment template

All changes are **backwards compatible** and **improve UX** even when backend is down.

---

## Support

If still having issues:

1. Check `storage/logs/laravel.log` for backend errors
2. Run `php artisan config:cache` if config issues
3. Clear browser cache (Ctrl+Shift+Delete)
4. Restart both terminal windows

**Expected behavior**: Notification bell works even if no notifications exist.
