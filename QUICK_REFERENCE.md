# ⚡ Quick Reference - NotificationBell Network Error

## The Error

```
AxiosError: Network Error
at api.get('/api/public/notifications')
```

## The Fix (30 seconds)

```bash
# Terminal 1
cd news-cms
php artisan serve --port=8010

# Terminal 2
cd frontend
npm run dev

# Open: http://localhost:3000 ✅
```

## What Was Fixed

### 1. Frontend Axios (`src/lib/axios.ts`)

```typescript
// ✅ Now supports env variable
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8010";

// ✅ Now has timeout
timeout: 10000;

// ✅ Now logs helpful messages
console.warn(`Network Error: Cannot reach ${API_BASE_URL}`);
```

### 2. Notification Bell (`src/components/NotificationBell.tsx`)

```typescript
// ✅ Error state handling
const [error, setError] = useState<string | null>(null)

// ✅ Won't crash anymore
if (e.message === 'Network Error') {
    setError('Backend not responding')
}

// ✅ Shows UI error message instead of crash
{error && <div className="bg-red-50">⚠️ {error}</div>}
```

### 3. Environment Template (`frontend/.env.example`)

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
```

### 4. Startup Scripts

- `start-dev.bat` - Windows CMD
- `start-dev.ps1` - Windows PowerShell
- `verify-setup.bat` - Setup checker

---

## Setup Checklist

- [ ] `frontend/.env.local` created (copy from `.env.example`)
- [ ] Laravel running: `php artisan serve --port=8010`
- [ ] Node running: `npm run dev` in frontend folder
- [ ] Browser loads: http://localhost:3000
- [ ] No red errors in browser console
- [ ] Notification bell visible and working

---

## Verification Commands

```bash
# Test backend endpoint
curl http://127.0.0.1:8010/api/public/notifications

# Check frontend env file
cat frontend/.env.local

# View backend logs
tail -f news-cms/storage/logs/laravel.log
```

---

## Common Issues

| Issue           | Solution                                       |
| --------------- | ---------------------------------------------- |
| "Network Error" | Start backend: `php artisan serve --port=8010` |
| 404 Endpoint    | Backend not running or wrong port              |
| CORS Error      | Check `news-cms/config/cors.php`               |
| Cannot GET /    | Frontend not running                           |

---

## Important Ports

- **Backend**: `http://127.0.0.1:8010` (Laravel)
- **Frontend**: `http://localhost:3000` (Next.js)

If ports conflict, change in:

- Backend: `php artisan serve --port=8011`
- Frontend: Update `.env.local` → `NEXT_PUBLIC_API_URL=http://127.0.0.1:8011`

---

## Files Changed

1. ✅ `frontend/src/lib/axios.ts` - Better error handling
2. ✅ `frontend/src/components/NotificationBell.tsx` - Graceful errors
3. ✅ `frontend/.env.example` - Configuration template

## Files Created

1. 📄 `frontend/.env.example` - Environment template
2. 📄 `FIX_NOTIFICATION_NETWORK_ERROR.md` - Detailed guide
3. 📄 `NETWORK_ERROR_FIX_SUMMARY.md` - Summary of changes
4. 🔧 `start-dev.bat` - Windows batch startup
5. 🔧 `start-dev.ps1` - PowerShell startup
6. 🔧 `verify-setup.bat` - Setup verification

---

## Next: After Fix Works

1. ✅ Notification bell loads
2. ✅ No console errors
3. Create test notifications in admin panel
4. Verify they appear in bell
5. Test real-time updates (60-second poll)

---

**Status**: ✅ FIXED and ENHANCED

Ready to use! Just start the servers and go to http://localhost:3000
