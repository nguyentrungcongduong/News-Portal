# Auth Test Instructions

## Current Setup:
- CORS: Configured for localhost origins
- Sanctum: Stateful domains include localhost:5173, localhost:3000
- Session: Using file driver with localhost domain
- CSRF: Interceptor added to axios to attach XSRF-TOKEN

## Test Steps:

### 1. Clear Everything
```bash
# In browser DevTools (F12):
- Application → Storage → Clear Site Data
- Close all tabs
```

### 2. Open Fresh Incognito Window

### 3. Login Sequence
```
1. Go to: http://localhost:5173/login
2. Email: admin@news.com
3. Password: password
4. Click Login
```

### 4. Check Network Tab
- Look for `/sanctum/csrf-cookie` - should return 204
- Look for `/api/auth/login` - should return 200 with user data
- Check Response Headers for "Set-Cookie" - should see session cookie

### 5. Verify Session
- After login, check Application → Cookies
- Should see:
  - XSRF-TOKEN
  - newsportal-session (or similar name)

### 6. Check Auth State
- Network tab should show `/api/auth/me` returns 200 with user data
- Dashboard should load without 401 errors

## If Still Getting 401:

The session cookie might not be getting sent. Check:
1. Cookie domain matches (should be 'localhost')
2. Cookie SameSite is 'lax'
3. Cookie Secure is false (for HTTP)

## Debug Command:
```bash
# Check session config
php artisan tinker
>>> config('session')
```
