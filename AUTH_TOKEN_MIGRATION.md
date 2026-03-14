# ✅ AUTHENTICATION SYSTEM - TOKEN BASED

## 🎯 What Changed

We switched from **session-based Sanctum** to **token-based authentication** (Bearer tokens).

## 📋 Backend Changes

### 1. AuthController (`app/Http/Controllers/Api/AuthController.php`)
```php
// Login now returns token
public function login(Request $request)
{
    // Validate credentials
    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();
    
    // Delete old tokens
    $user->tokens()->delete();
    
    // Create new token
    $token = $user->createToken('admin-token')->plainTextToken;

    return response()->json([
        'token' => $token,  // ← THIS IS THE KEY CHANGE
        'user' => $user,
        'message' => 'Login successful'
    ]);
}

//
 Logout deletes current token
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out']);
}
```

## 📋 Frontend Changes

### 1. api.js - Bearer Token Interceptor
```javascript
// Attach token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 (auto-logout)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

### 2. AuthContext.jsx - Token Storage
```javascript
const login = async (credentials) => {
    const response = await loginApi(credentials);
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    
    setUser(user);
    setIsAuthenticated(true);
    return response;
};
```

### 3. auth.js - Removed CSRF Logic
```javascript
// Before (session-based):
export const login = async (credentials) => {
    await csrf();  // ← REMOVED
    return api.post('/api/auth/login', credentials);
};

// After (token-based):
export const login = async (credentials) => {
    return api.post('/api/auth/login', credentials);
};
```

## 🧪 How to Test

1. **Clear everything:**
   ```
   - Browser: Clear all cookies & localStorage
   - Close all browser windows
   ```

2. **Open fresh Incognito window**

3. **Go to:** `http://localhost:5173/login`

4. **Login:**
   - Email: `admin@news.com`
   - Password: `password`

5. **Check DevTools:**
   - Application → Local Storage → Should see `auth_token`
   - Network → Login request should return `{"token": "...", "user": {...}}`
   - Subsequent requests should have header: `Authorization: Bearer <token>`

6. **Verify:**
   - Dashboard loads without 401 errors
   - All admin routes work (Posts, Categories, Stats)
   - No redirect to `/login` web route
   - On page refresh, auth persists (token still in localStorage)

## ✅ Expected Behavior

| Action | Result |
|--------|--------|
| Login success | Token stored in localStorage |
| API requests | Include `Authorization: Bearer <token>` header |
| 401 response | Auto-logout + redirect to login |
| Logout | Token deleted from localStorage |
| Page refresh | Token retrieved from localStorage, user stays logged in |

##  NO MORE:
- ❌ CSRF cookies
- ❌ Session cookies
- ❌ CORS issues with withCredentials
- ❌ Redirect to `/login` blade route
- ❌ 127.0.0.1 vs localhost conflicts

## ✅ NOW WE HAVE:
- ✅ Simple Bearer token
- ✅ Stored in localStorage
- ✅ Auto-attached to requests
- ✅ Works across any origin
- ✅ Standard REST API auth

## 🔒 Security Notes

- Tokens are httpOnly: NO (localStorage is not httpOnly)
- XSS protection: Sanitize all user input
- Token expiration: Configurable in Sanctum config
- HTTPS required in production: YES

This is the **industry standard** for SPA + API authentication!
