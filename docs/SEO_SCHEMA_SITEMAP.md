# 🔍 SEO Schema + Sitemap System

## Overview

Giúp Google hiểu đây là **báo điện tử thực sự** → index nhanh + rich results.

## PHẦN 1: NewsArticle Schema

### JSON-LD Structure

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Bão số 3 sắp đổ bộ",
  "image": ["https://..."],
  "datePublished": "2026-01-20T08:00:00Z",
  "dateModified": "2026-01-20T09:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Nguyễn Văn A"
  },
  "publisher": {
    "@type": "Organization",
    "name": "NewsPortal",
    "logo": {
      "@type": "ImageObject",
      "url": "https://.../logo.png"
    }
  },
  "articleBody": "..."
}
```

### Implementation

#### Service Layer

```php
$schemaService = app(SeoSchemaService::class);

// Get schema (cached)
$schema = $schemaService->getSchemaForPost($post);

// Clear cache after update
$schemaService->clearSchemaCache($post);
```

#### Blade Template

```html
<!-- In post show page -->
<head>
  <x-seo-schema :post="$post" />
</head>
```

#### Frontend (React/Next)

```tsx
// Inject vào <head> khi server render
const schema = await seoService.getSchemaForPost(postId);
```

### Cache Strategy

- ✅ Cache 24 hours
- ✅ Clear on post update
- ✅ Clear on publish
- ✅ Auto-refresh

### Fields Included

- ✅ headline (title)
- ✅ description (summary)
- ✅ image (thumbnail)
- ✅ datePublished
- ✅ dateModified
- ✅ author (name + url)
- ✅ publisher (org + logo)
- ✅ articleBody (content)

## PHẦN 2: XML Sitemap

### Routes

```
GET /sitemap.xml              → Main sitemap
GET /sitemap-index.xml        → Sitemap index (multi-lang)
GET /news-sitemap.xml         → Google News sitemap
```

### Main Sitemap (`/sitemap.xml`)

Bao gồm:

- Homepage (priority: 1.0, weekly)
- Published posts (priority: 0.8, weekly)
- Categories (priority: 0.7, weekly)
- Static pages (priority: 0.6, monthly/yearly)

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://newsportal.vn/</loc>
    <lastmod>2026-01-21T10:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://newsportal.vn/posts/bao-so-3</loc>
    <lastmod>2026-01-21T09:30:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### News Sitemap (`/news-sitemap.xml`)

Google News format - chỉ bài viết **48 giờ gần nhất**:

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://newsportal.vn/posts/bao-so-3</loc>
    <news:news>
      <news:publication_date>2026-01-21T08:00:00Z</news:publication_date>
      <news:title>Bão số 3 sắp đổ bộ</news:title>
      <news:publication name="NewsPortal" language="vi" />
    </news:news>
  </url>
</urlset>
```

### Cache Strategy

- ✅ Main sitemap: 10 min cache
- ✅ News sitemap: 5 min cache
- ✅ Auto-clear on post publish
- ✅ Query published posts only

### Robots.txt Integration

```
User-agent: *
Allow: /

Sitemap: https://newsportal.vn/sitemap.xml
Sitemap: https://newsportal.vn/news-sitemap.xml
```

## PHẦN 3: Slug History & 301 Redirect

### Database Schema

```
post_slugs:
- id (PK)
- post_id (FK)
- old_slug (UNIQUE)
- created_at
```

### Workflow

1. **Post created** → slug = "bao-so-3"
2. **Edit slug** → slug = "bao-so-3-da-cap-nhat"
   - Old slug "bao-so-3" saved to post_slugs
3. **Someone visits old URL** → 301 redirect to new slug
4. **Google updates** → all backlinks point to new URL

### Middleware

```php
// /api/v1/posts/bao-so-3 (old)
↓
// Check post_slugs table
↓
// 301 redirect to /api/v1/posts/bao-so-3-da-cap-nhat
```

### Observer Auto-Track

```php
Post::updated(function($post) {
    if ($post->isDirty('slug')) {
        PostSlug::create([
            'post_id' => $post->id,
            'old_slug' => $post->getOriginal('slug')
        ]);
    }
});
```

## Integration Checklist

### Backend

- [x] Migration content_locks
- [x] Migration editorial_notes
- [x] Migration post_slugs
- [x] Models + relationships
- [x] Controllers + API
- [x] Services (Schema + Sitemap)
- [x] Observer (auto-cache clear)
- [x] Middleware (slug redirect)
- [ ] Register observer in AppServiceProvider
- [ ] Add routes to web.php + api.php
- [ ] Add middleware to kernel

### Frontend

- [x] ContentLockIndicator component
- [x] useLock hook
- [x] EditorialNotes component
- [ ] Integrate into post editor
- [ ] Handle lock errors gracefully
- [ ] Add schema injection to post detail page

### Google Integration

- [ ] Submit sitemap to Google Search Console
- [ ] Verify News Publisher status
- [ ] Test NewsArticle schema (rich results)
- [ ] Monitor crawl stats

## Monitoring & Debugging

### Check sitemap validity

```bash
curl https://newsportal.vn/sitemap.xml | head -20
curl https://newsportal.vn/news-sitemap.xml | grep '<url>' | wc -l
```

### Validate schema

Use: https://schema.org/validator/

### Google Search Console

- Monitor index status
- Check crawl errors
- Review rich results

### Lock status check

```php
// Laravel tinker
ContentLock::where('lockable_type', 'Post')->get();
```

## Performance

- ✅ Sitemap cached 5-10 min
- ✅ Schema cached 24 hours
- ✅ Only published posts in sitemap
- ✅ Minimal DB queries
- ✅ Async cache clearing possible

## SEO Benefits

✅ **Faster indexing**: Google recognizes news site
✅ **Rich results**: NewsArticle schema = rich snippets
✅ **News carousel**: Eligible for Google News
✅ **Sitemap crawl**: All content discoverable
✅ **Redirect tracking**: No 404s on slug changes
