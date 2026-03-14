# 🧪 TESTING LIKE & COMMENT - WITHOUT UI

## ✅ Test User Created

**Email:** `test@news.com`  
**Password:** `123456`  
**Role:** `user`

---

## 📋 STEP 1: Login via Postman/cURL

### Using cURL (PowerShell):
```powershell
curl -X POST http://localhost:8000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@news.com","password":"123456"}'
```

### Using Postman:
```
POST http://localhost:8000/api/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "test@news.com",
  "password": "123456"
}
```

**Expected Response:**
```json
{
  "token": "1|veryLongTokenString...",
  "user": {
    "id": 4,
    "name": "Test User",
    "email": "test@news.com",
    "role": "user"
  },
  "message": "Login successful"
}
```

**→ Copy the `token` value**

---

## 📋 STEP 2: Test Like API

### Like a Post:
```powershell
curl -X POST http://localhost:8000/api/public/posts/1/like `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Accept: application/json"
```

### Postman:
```
POST http://localhost:8000/api/public/posts/1/like
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Accept: application/json
```

**Expected Response:**
```json
{
  "liked": true,
  "likes_count": 1
}
```

**Test Unlike (call again):**
```json
{
  "liked": false,
  "likes_count": 0
}
```

---

## 📋 STEP 3: Test Comment API

### Post a Comment:
```powershell
curl -X POST http://localhost:8000/api/public/posts/bai-viet-mau-so-1-tin-tuc-he-thong-news-portal-1/comments `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -H "Content-Type: application/json" `
  -d '{"content":"This is a test comment from API!"}'
```

### Postman:
```
POST http://localhost:8000/api/public/posts/{slug}/comments
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
Body (raw JSON):
{
  "content": "This is a test comment from API!"
}
```

**Expected Response:**
```json
{
  "message": "Comment posted successfully",
  "data": {
    "id": 1,
    "content": "This is a test comment from API!",
    "user": {
      "name": "Test User"
    },
    "created_at": "2026-01-18T10:30:00.000000Z"
  }
}
```

---

## 📋 STEP 4: Get Comments for a Post

```powershell
curl http://localhost:8000/api/public/posts/{slug}/comments
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "content": "This is a test comment from API!",
      "user": {
        "name": "Test User"
      },
      "created_at": "2026-01-18T10:30:00.000000Z"
    }
  ]
}
```

---

## 🎯 TESTING CHECKLIST

- [ ] Login successful → Receive token
- [ ] Like post → `liked: true`, count increases
- [ ] Unlike post → `liked: false`, count decreases
- [ ] Post comment → Comment created
- [ ] Get comments → See posted comment
- [ ] Like without token → 401 Unauthorized
- [ ] Comment without token → 401 Unauthorized

---

## 🚀 NEXT STEPS (After Testing)

1. ✅ Like API works
2. ✅ Comment API works
3. ⏭️ Build React UI for Like button
4. ⏭️ Build React UI for Comment form
5. ⏭️ Add Login/Register UI (LAST)

---

## 💡 PRO TIPS

### Save Token in Postman Environment:
1. Create environment variable: `auth_token`
2. In login request → Tests tab:
```javascript
pm.environment.set("auth_token", pm.response.json().token);
```
3. Use `{{auth_token}}` in Authorization header

### Quick Test Script:
```bash
# Save this as test-like.ps1
$token = "YOUR_TOKEN_HERE"
curl -X POST http://localhost:8000/api/public/posts/1/like `
  -H "Authorization: Bearer $token" `
  -H "Accept: application/json"
```

---

## 🔒 IMPORTANT NOTES

- This test user is for **development only**
- Token expires based on Sanctum config
- Production will have proper OAuth/Social login
- Guest comments can be added later if needed

**Current Focus:** Test business logic, NOT auth UI! ✅
