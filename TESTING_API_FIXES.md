# 🧪 Complete Testing Guide - API URL Fixes

## Overview

All API URL issues have been fixed! Here's how to verify everything works.

## Pre-Flight Checklist

### ✅ Environment Variables

```bash
cd frontend
cat .env.local
```

Should contain:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8010
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### ✅ Backend Running

```bash
cd news-cms
php artisan serve --port=8010 --host=127.0.0.1
```

Wait for: `Started local development server`

### ✅ Frontend Running

```bash
cd frontend
npm run dev
```

Wait for: `Ready in XXXms`

---

## Test Scenarios

### 1️⃣ Homepage Load

**What it tests**: Fetch API calls to `/api/public/home`

**Steps**:

1. Open http://localhost:3000
2. Wait for page to load
3. Should see:
   - ✅ Featured posts
   - ✅ Categories list
   - ✅ Trending posts
   - ✅ No console errors

**If it fails**:

```
Failed to fetch home data
```

- Check browser console (F12) → Console tab
- Look for error message showing actual URL and error
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

---

### 2️⃣ Category Page

**What it tests**: Dynamic routes + fetch API for categories

**Steps**:

1. On homepage, click any category
2. URL should change to `/category/[category-name]`
3. Should see:
   - ✅ Posts in that category
   - ✅ Pagination
   - ✅ No API errors

**Endpoint called**: `http://127.0.0.1:8010/api/public/categories/{slug}?page=1`

---

### 3️⃣ Post Detail Page

**What it tests**: Single post fetch + comments + likes

**Steps**:

1. On any category page, click a post
2. URL should be `/post/[slug]`
3. Should see:
   - ✅ Full post content
   - ✅ Comments loaded
   - ✅ Like button working
   - ✅ Related posts

**Endpoints called**:

- `http://127.0.0.1:8010/api/public/posts/{slug}` (get post)
- `http://127.0.0.1:8010/api/public/posts/{slug}/comments` (get comments)
- `http://127.0.0.1:8010/api/public/posts/{slug}/like` (post like) - via axios

---

### 4️⃣ Notifications (Auth Required)

**What it tests**: Axios API calls for authenticated endpoints

**Steps**:

1. Login to the site (click Login)
2. Navigate to any page
3. Look at top-right notification bell icon 🔔
4. Should see:
   - ✅ Bell icon visible
   - ✅ Click bell → notification dropdown appears
   - ✅ Notifications loaded

**Endpoint called**: `http://127.0.0.1:8010/api/public/notifications` (via axios)

---

### 5️⃣ Search

**What it tests**: Query parameter passing + fetch API

**Steps**:

1. On homepage, use search box (top of page)
2. Type a word like "tech" or "news"
3. Press Enter
4. Should be redirected to search results
5. Should see:
   - ✅ Results matching search term
   - ✅ Pagination
   - ✅ No errors

**Endpoint called**: `http://127.0.0.1:8010/api/public/search?q={query}&page=1`

---

### 6️⃣ Author Page (if exists)

**What it tests**: Dynamic author routes

**Steps**:

1. Click on author name on any post
2. URL should be `/author/[author-name]`
3. Should see:
   - ✅ All posts by author
   - ✅ Author info
   - ✅ Pagination

**Endpoint called**: `http://127.0.0.1:8010/api/public/authors/{slug}?page=1`

---

## API Call Audit

### Fetch-based calls (uses `api.ts`)

All these should work correctly now:

| Function             | Endpoint                        | Method |
| -------------------- | ------------------------------- | ------ |
| `getHomeData()`      | `/api/public/home`              | GET    |
| `getCategoryData()`  | `/api/public/categories/{slug}` | GET    |
| `getAuthorData()`    | `/api/public/authors/{slug}`    | GET    |
| `getPosts()`         | `/api/public/posts`             | GET    |
| `getPostBySlug()`    | `/api/public/posts/{slug}`      | GET    |
| `getCategories()`    | `/api/public/categories`        | GET    |
| `getTrendingPosts()` | `/api/public/trending`          | GET    |
| `searchPosts()`      | `/api/public/search?q={q}`      | GET    |

### Axios-based calls (uses `axios.ts`)

All these use `baseURL: http://127.0.0.1:8010` automatically:

| Location         | Endpoint                              | Method   |
| ---------------- | ------------------------------------- | -------- |
| NotificationBell | `/api/public/notifications`           | GET      |
| Comments         | `/api/public/posts/{slug}/comments`   | GET/POST |
| LikeButton       | `/api/public/posts/{postId}/like`     | POST     |
| ContentLock      | `/api/content-locks/acquire`          | POST     |
| EditorialNotes   | `/api/posts/{postId}/editorial-notes` | GET/POST |

---

## Browser Console Debugging (F12)

### Network Tab

1. Open http://localhost:3000
2. Press F12 → Network tab
3. Refresh page
4. Look for API calls:
   - Should see requests to `127.0.0.1:8010`
   - Status should be `200` or `201` (not 404/500)
   - Response should contain JSON data

### Console Tab

1. Press F12 → Console tab
2. Should see NO red errors
3. May see gray info/debug messages - that's OK
4. Look for any "Failed to fetch" or 404 messages

---

## Troubleshooting

### Issue: "Failed to fetch home data"

**Step 1**: Check if backend is running

```bash
curl http://127.0.0.1:8010/api/public/home
```

Should return JSON with posts

**Step 2**: Check `.env.local`

```bash
cat frontend/.env.local
```

Must have: `NEXT_PUBLIC_API_URL=http://127.0.0.1:8010` (NO `/api/public` at end)

**Step 3**: Check Network requests

1. F12 → Network tab
2. Reload page
3. Find request to `api/public/home`
4. Check Status code
5. Click → Response tab → see what error message backend returned

### Issue: CORS errors

**Symptoms**:

```
Access to XMLHttpRequest... has been blocked by CORS policy
```

**Solution**:

1. Check backend `config/cors.php` - should allow localhost:3000
2. Restart Laravel: `php artisan serve --port=8010`

### Issue: Connection Refused

**Symptoms**:

```
Failed to fetch: errno -111 Connection refused
```

**Solution**:

1. Backend not running!
2. Start it: `cd news-cms && php artisan serve --port=8010`

---

## Success Indicators ✅

When everything is working:

1. ✅ Homepage loads with posts, categories, trending
2. ✅ No red errors in browser console
3. ✅ Network tab shows requests to `127.0.0.1:8010`
4. ✅ All responses have status 200/201
5. ✅ Pagination works
6. ✅ Search works
7. ✅ Notification bell shows (after login)
8. ✅ Like button responds to clicks
9. ✅ Comments load on post detail pages

---

## Files Modified

1. ✅ `frontend/.env.local` - Corrected API URL
2. ✅ `frontend/src/lib/api.ts` - Fixed API URL construction, added error handling
3. ✅ `frontend/src/lib/axios.ts` - Already correct
4. ✅ `frontend/src/components/NotificationBell.tsx` - Fixed syntax error, improved error handling

---

## Quick Reference: URL Construction

```
BASE URL: http://127.0.0.1:8010 (from .env.local NEXT_PUBLIC_API_URL)

For fetch() calls:
http://127.0.0.1:8010 + /api/public + /home
= http://127.0.0.1:8010/api/public/home ✅

For axios calls:
baseURL: http://127.0.0.1:8010
endpoint: /api/public/notifications
axios.get('/api/public/notifications')
= GET http://127.0.0.1:8010/api/public/notifications ✅
```

---

**Now test everything! Happy coding! 🚀**
