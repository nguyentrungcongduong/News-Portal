# 📰 News Portal - Full Production Setup

## Overview

Hệ thống CMS báo điện tử hoàn chỉnh với 3 module liên tiếp:

1. **Content Lock** - Ngăn chặn xung đột edit
2. **Editorial Notes** - Ghi chú biên tập nội bộ
3. **SEO Schema + Sitemap** - Google News indexing

---

## 🚀 Installation & Setup

### 1. Run Migrations

```bash
php artisan migrate
```

Tạo tables:

- `content_locks` - Quản lý khóa nội dung
- `editorial_notes` - Ghi chú biên tập
- `post_slugs` - Lịch sử slug
- Thêm `include_in_sitemap` vào `posts`

### 2. Register Observer

File: `app/Providers/AppServiceProvider.php`

```php
protected function registerObservers(): void
{
    \App\Models\Post::observe(\App\Observers\PostObserver::class);
}
```

### 3. Register Routes

API routes tại: `routes/api.php` ✓
Web routes tại: `routes/web.php` ✓

### 4. Generate Sitemaps (Manual)

```bash
php artisan sitemap:generate
```

### 5. Seed Test Data

```bash
php artisan db:seed --class=ContentLockSeeder
php artisan db:seed --class=EditorialNoteSeeder
```

---

## 📋 API Documentation

### Content Lock

```
POST   /api/content-locks/acquire      - Khóa resource
POST   /api/content-locks/release      - Mở khóa
GET    /api/content-locks/check        - Kiểm tra trạng thái
POST   /api/content-locks/renew        - Kéo dài khóa (keep-alive)
POST   /api/content-locks/force-unlock - Admin: Mở khóa cưỡng chế
```

### Editorial Notes

```
GET    /api/posts/{id}/editorial-notes       - Lấy danh sách
POST   /api/posts/{id}/editorial-notes       - Tạo (editor/admin)
PUT    /api/posts/{id}/editorial-notes/{id}  - Sửa (author/admin)
DELETE /api/posts/{id}/editorial-notes/{id}  - Xóa (author/admin)
GET    /api/posts/{id}/editorial-notes/count - Đếm note
```

### Sitemap & SEO

```
GET /sitemap.xml           - Main sitemap (cache 10 min)
GET /news-sitemap.xml      - Google News (cache 5 min)
GET /sitemap-index.xml     - Sitemap index
```

---

## 🎨 Frontend Integration

### 1. Content Lock Indicator

```tsx
import ContentLockIndicator from "@/components/ContentLockIndicator";

<ContentLockIndicator
  postId={123}
  onLocked={(lock) => console.log("Locked by:", lock.user_name)}
/>;
```

### 2. Lock Hook

```tsx
import { useLock } from "@/hooks/useLock";

function EditPost() {
  const { isLocked, lockError } = useLock({
    lockable_type: "Post",
    lockable_id: 123,
  });

  return isLocked ? <Editor /> : <Locked />;
}
```

### 3. Editorial Notes Panel

```tsx
<EditorialNotes postId={123} canEdit={true} userRole="editor" />
```

### 4. SEO Schema (Blade)

```html
<head>
  <x-seo-schema :post="$post" />
</head>
```

---

## 🧪 Testing

### Run All Tests

```bash
php artisan test
```

### Test Content Locks

```bash
php artisan test --filter=ContentLockTest
```

### Test Editorial Notes

```bash
php artisan test --filter=EditorialNoteTest
```

### Test Sitemaps

```bash
php artisan test --filter=SitemapTest
```

---

## 🔧 Configuration

Edit `config/seo.php` để customize:

```php
'content_lock' => [
    'duration_minutes' => 10, // TTL
],

'sitemap' => [
    'cache_minutes' => 10,
    'news_cache_minutes' => 5,
    'news_hours' => 48,
],

'editorial_notes' => [
    'default_visibility' => 'editor',
],
```

---

## 📊 Database Schema

### content_locks

```
id, lockable_type, lockable_id, user_id, locked_at, expires_at
```

### editorial_notes

```
id, post_id, user_id, note, visibility (editor|admin), timestamps
```

### post_slugs

```
id, post_id, old_slug, created_at
```

### posts (updated)

```
+ include_in_sitemap (boolean, default true)
```

---

## 🔐 Security & Permissions

### Content Lock

- ✅ Requires `auth:sanctum`
- ✅ Force unlock: `role:admin`
- ✅ Auto audit log

### Editorial Notes

- ✅ Create: `role:editor,admin`
- ✅ Edit/Delete: author or admin
- ✅ View: based on visibility level

### Sitemaps

- ✅ Public (no auth)
- ✅ Only published posts
- ✅ Cached for performance

---

## 🚨 Common Issues

### Lock không được release

```php
// Manual cleanup
ContentLock::where('expires_at', '<', now())->delete();
```

### Sitemap không updated

```bash
# Clear cache
php artisan cache:clear

# Regenerate
php artisan sitemap:generate
```

### Note visibility không work

```php
// Check visibility enum
EditorialNote::where('visibility', 'editor')->count();
```

---

## 📈 Performance

| Component    | Cache | TTL      |
| ------------ | ----- | -------- |
| Main Sitemap | Redis | 10 min   |
| News Sitemap | Redis | 5 min    |
| SEO Schema   | Redis | 24 hours |
| Lock Check   | -     | Realtime |
| Notes        | -     | Realtime |

---

## 📚 Documentation Files

- 📄 `docs/CONTENT_LOCK.md` - Content Lock specs
- 📄 `docs/EDITORIAL_NOTES.md` - Editorial Notes specs
- 📄 `docs/SEO_SCHEMA_SITEMAP.md` - SEO & Sitemap specs

---

## ✅ Deployment Checklist

- [ ] Run migrations
- [ ] Register observer
- [ ] Set up Laravel queue (for async tasks)
- [ ] Configure cache (Redis preferred)
- [ ] Test all 3 modules
- [ ] Generate sitemaps
- [ ] Submit to Google Search Console
- [ ] Monitor crawl stats
- [ ] Set up log rotation

---

## 🎯 Future Enhancements

1. **Multi-language SEO** - Hreflang tags + separate sitemaps
2. **Async Sitemap Generation** - Queue job on publish
3. **Lock Notifications** - Notify users when lock expires
4. **Note Notifications** - Email on new note
5. **Collaborative Editing** - Real-time lock updates via WebSocket
6. **Analytics** - Track lock conflicts + note patterns

---

## 💡 Support

For issues or questions:

1. Check docs/
2. Review tests/Feature/
3. Check logs: `storage/logs/`

---

**Status**: ✅ Production Ready

**Last Updated**: January 21, 2026

**Maintainer**: Tech Lead - News Portal Team
