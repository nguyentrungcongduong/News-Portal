# DEBUG STEPS - Troubleshoot "Lỗi tải danh sách bài viết"

## Bước 1: Check Console Errors
Mở DevTools (F12) → Console
- Có lỗi gì không?
- Copy toàn bộ lỗi màu đỏ

## Bước 2: Check Network Tab
DevTools → Network → Filter: Fetch/XHR

Tìm request `/api/admin/posts`
- Status code là gì? (200, 401, 419, 500?)
- Request Headers có `Authorization: Bearer ...` không?
- Response trả về gì?

## Bước 3: Check LocalStorage
DevTools → Application → Local Storage → `http://localhost:5173`
- Có key `auth_token` không?
- Giá trị của nó là gì? (copy ra)

## Bước 4: Check Login Response
DevTools → Network → Tìm request `/api/auth/login`
- Status: 200?
- Response Body có chứa `token` và `user` không?
- Copy response JSON ra

## Bước 5: Manual Test
Trong Console, chạy:
```javascript
// Check if token exists
localStorage.getItem('auth_token')

// Check current user
fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
}).then(r => r.json()).then(console.log)
```

## Common Issues:

### Issue 1: Token không lưu vào localStorage
**Nguyên nhân:** Login response structure không đúng
**Kiểm tra:** Response có đúng format `{token, user}` không

### Issue 2: Token không được gửi trong request
**Nguyên nhân:** Axios interceptor không chạy
**Kiểm tra:** Check request headers có `Authorization` không

### Issue 3: Backend trả 401
**Nguyên nhân:** Token invalid hoặc expired
**Kiểm tra:** Thử login lại

### Issue 4: Token valid nhưng vẫn lỗi
**Nguyên nhân:** Backend controller có lỗi
**Kiểm tra:** Check Laravel logs

## Quick Fix Commands:

```javascript
// Clear và test lại
localStorage.clear();
location.reload();
```

Sau đó login lại và kiểm tra từng bước.
