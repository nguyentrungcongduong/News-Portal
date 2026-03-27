# News Portal CMS 🚀

[![Laravel](https://img.shields.io/badge/Laravel-12.0-red)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)

**News Portal CMS** là hệ thống quản lý tin tức chuyên nghiệp dành cho tòa soạn báo điện tử. Ứng dụng được xây dựng theo kiến trúc Headless CMS hiện đại (Decoupled Architecture) với API bằng Laravel và Frontend xử lý bằng React/Next.js. Hệ thống cung cấp đầy đủ các tính năng cho một tòa soạn thực tế bao gồm quy trình xuất bản bài viết (Workflow), quản lý Media, Page Builder kéo thả mạnh mẽ, tính toán Thống kê lượt xem theo thời gian thực (Redis) và hệ thống kiểm duyệt nhận xét.

---

## 🌐 Trải nghiệm Livestream (Live Demos)

- 📰 **Trang tin Public (Dành cho độc giả):** [https://news-portal-public-gray.vercel.app](https://news-portal-public-gray.vercel.app)
- ⚙️ **Trang Quản trị (Admin CMS):** [https://news-portal-admin-beta.vercel.app](https://news-portal-admin-beta.vercel.app)

---

## 🔑 Tài khoản dùng thử Admin (Demo Accounts)

Bạn có thể truy cập đường dẫn **Trang Quản trị** ở trên và sử dụng các tài khoản sau để đăng nhập thử nghiệm:

| Vai trò (Role) | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@news.com` | `password` | Toàn quyền hệ thống, page builder, quản lý User, Duyệt bài |
| **Biên tập viên (Editor)** | `editor@news.com` | `password` | Quản lý danh mục, Chỉnh sửa và Duyệt bài chờ xuất bản |
| **Phóng viên (Author)** | `author@news.com` | `password` | Viết bài mới gửi duyệt, Quản lý bài cá nhân |

> **Lưu ý:** Bạn hoàn toàn có thể sử dụng chức năng "Tiếp tục với Google" trên trang Public để tự động đăng ký với tư cách Độc giả (User), và nộp form yêu cầu để xét duyệt làm Author nếu muốn.

---

## 📚 Tài liệu dự án (Documentation)

Để hiểu rõ hơn về hệ thống, vui lòng tham khảo các tài liệu chuyên sâu trong thư mục `/docs`:

- 🏗️ **[Kiến trúc hệ thống (Architecture)](./docs/ARCHITECTURE.md)**: Giải quyết các bài toán về Tech Stack, Design Patterns và Database.
- ⚙️ **[Quy trình Workflow (Post Workflow)](./docs/WORKFLOW.md)**: Chi tiết về vòng đời bài viết và phân quyền.
- 🔌 **[Tài liệu API (API Specs)](./docs/API.md)**: Danh sách các Endpoint, Request/Response và Data Contract.
- 🚀 **[Kế hoạch xây dựng (Construction Plan)](./docs/CONSTRUCTION%20PLAN%20FROM%20A%20TO%20Z.md)**: Lộ trình phát triển từ A đến Z.

---

## 1. Kiến trúc tổng thể (Architecture)
Với yêu cầu này, anh đề xuất mô hình Decoupled Architecture (Backend API và Frontend SPA) hoặc Inertia.js.
Lựa chọn tối ưu: Dùng Inertia.js cho trang Quản trị (Admin Panel) để phát triển cực nhanh, và Laravel Sanctum nếu sau này em muốn làm App Mobile.
Database: MySQL hoặc PostgreSQL.
Caching: Redis (bắt buộc cho phần View Statistics và Trending Heatmap để tránh quá tải DB).
2. Thiết kế Cơ sở dữ liệu (Database Schema) sơ bộ
Dựa trên file em gửi, anh liệt kê các bảng chính cần có:
Users & Authors: id, name, email, password, role (admin/editor/author), bio, avatar, social_links.
Categories: id, parent_id (cấu trúc cây), name, slug, layout_type, order, status.
Posts: id, author_id, title, slug, summary, content, thumbnail, status (draft/pending/published), scheduled_at, views_count, seo_tags (JSON).
Tags: id, name, slug.
Post_Tag: (Bảng trung gian).
Comments: id, post_id, user_id, parent_id, content, status (approved/spam/pending).
Post_Versions: id, post_id, content, created_by, created_at (Lưu lịch sử bài viết).
Media: id, file_path, file_type, size, alt_text, folder_id.
Ads: id, title, position, type, image_url, link, status, quota_limit, clicks, impressions.
3. Giải pháp cho các Module khó
A. Module Post & SEO (Trái tim của dự án)
Rich Text Editor: Trong React, hãy dùng TipTap hoặc CKEditor 5. TipTap tốt hơn nếu em muốn tùy biến các block nội dung như 24h.
SEO: Tạo một Trait trong Laravel gọi là HasSEO để dùng chung cho Post, Category, Page.
Version History: Mỗi lần Update bài viết, hãy bắn một Eloquent Event (updated) để lưu bản backup vào bảng post_versions.
B. Module Media (Tối ưu hóa hình ảnh)
Dùng Spatie Laravel MediaLibrary. Nó hỗ trợ tự động convert sang WebP, tạo nhiều size thumbnail (Responsive) và lưu trữ S3 nếu cần.
Cài đặt Intervention Image để xử lý resize.
C. Analytics & Trending (Phần "nặng" nhất)
Không ghi trực tiếp vào DB mỗi lần user click. Mỗi lượt xem bài viết, hãy đẩy vào Redis INCR. Sau đó dùng Laravel Scheduler chạy mỗi 5-10 phút để đồng bộ số liệu từ Redis về MySQL.
Trending Heatmap: Tính toán dựa trên vận tốc tăng trưởng lượt xem (Views/Time) trong Redis.
D. Page Builder
Dùng mẫu thiết kế JSON-based layout. React sẽ render các component dựa trên cục JSON mà Laravel trả về.
Thư viện gợi ý cho React: react-beautiful-dnd hoặc dnd-kit để kéo thả.
4. Cấu trúc thư mục Backend (Service Pattern)
Anh khuyên em không nên viết logic trong Controller. Hãy dùng Service Pattern:
code
Text
app/
├── Services/
│   ├── PostService.php      (Xử lý logic duyệt bài, lên lịch)
│   ├── MediaService.php     (Xử lý upload, tối ưu ảnh)
│   └── AnalyticsService.php  (Xử lý Redis & Thống kê)
├── Http/
│   ├── Controllers/
│   │   └── Admin/
│   │       └── PostController.php
│   └── Resources/           (Để format JSON trả về cho React)
│       └── PostResource.php
5. Lộ trình thực hiện (Sprints)
Sprint 1 (Base & Auth): Setup Laravel, Sanctum, Role/Permission (dùng Spatie Permission), Login/OAuth.
Sprint 2 (Category & Tag): Quản lý danh mục (cấu trúc cây) và Tag.
Sprint 3 (Media & Post): Xây dựng bộ upload ảnh và trình soạn thảo bài viết. Đây là phần tốn thời gian nhất.
Sprint 4 (Workflow & Comment): Quy trình duyệt bài, lịch sử phiên bản và bộ lọc comment (Anti-spam).
Sprint 5 (Analytics & Ads): Thống kê và hệ thống quảng cáo.
Sprint 6 (Page Builder & UI): Hoàn thiện trang chủ, các trang tĩnh và tối ưu SEO.
6. Tech Lead Tips cho em:
Slug: Luôn dùng Str::slug() và phải có cơ chế kiểm tra trùng lặp (append thêm ID nếu trùng).
Performance: Với trang tin tức, hãy dùng Full Page Caching hoặc Cloudflare. Laravel có package spatie/laravel-responsecache rất tốt.
Security: Luôn validate dữ liệu đầu vào bằng FormRequest. Với phân quyền, hãy dùng Policy để bảo vệ các API bài viết.
Deployment: Setup CI/CD (GitHub Actions) để tự động chạy Unit Test và deploy lên server mỗi khi em push code.


//update architecture 
👉 Ở góc độ Tech Lead: CÂU TRẢ LỜI NGẮN GỌN LÀ RẤT ỔN – mức 8.5/10
Với scope “báo điện tử như 24h”, proposal này đủ chuẩn để bắt đầu dự án thật, không phải demo sinh viên 👍

Bây giờ anh sẽ review đúng kiểu Tech Lead:

xác nhận đúng

chỉ ra điểm cần chỉnh

bổ sung những thứ hay bị thiếu khi đi production

1. Kiến trúc tổng thể – ĐÁNH GIÁ
✅ Quyết định đúng

Decoupled / Inertia hybrid → rất thực tế

Inertia cho Admin → giảm 30–40% effort

Sanctum → mở đường cho Mobile App

Redis bắt buộc → chuẩn cho news traffic

👉 Đây là kiến trúc mà 90% team báo lớn tại VN đang dùng (Laravel + Inertia + Next/React public).

🔧 Gợi ý chỉnh nhẹ

Frontend Public:
👉 Nếu có điều kiện → Next.js riêng cho trang public

Admin Panel:
👉 Inertia + React (hoặc Vue) là quá hợp lý

📌 Kết luận: Quyết định kiến trúc PASS ✔️

2. Database Schema – ĐÁNH GIÁ
✅ Những gì em làm đúng

Tách post_versions ✔️

parent_id cho category tree ✔️

seo_tags JSON ✔️

comments có parent_id ✔️

Ads có quota, impression, click ✔️

⚠️ Chỉnh nhỏ nhưng QUAN TRỌNG
2.1 Users & Authors

❌ Không nên gộp hoàn toàn Users & Authors

👉 Đề xuất Tech Lead:

users (login, role, security)
authors (profile, bio, avatar)


Vì:

Admin không phải Author

Sau này có guest author / external contributor

2.2 Posts

Nên bổ sung:

posts:
- published_at
- is_featured (boolean)
- priority (pin bài)


👉 Báo điện tử luôn cần pin & bài nổi bật

2.3 Views

❌ Không nên chỉ lưu views_count trong posts

👉 Chuẩn hơn:

post_views_daily:
- post_id
- date
- views


👉 Redis → sync → bảng này
Dùng cho:

Trending

Heatmap

Chart

3. Module khó – REVIEW RẤT TỐT
A. Post & SEO

✅ HasSEO Trait → chuẩn bài bản
✅ Eloquent Event cho versioning → đúng hướng

👉 Gợi ý nâng cấp:

Lưu diff JSON thay vì full content (tiết kiệm storage)

B. Media

✅ Spatie MediaLibrary → lựa chọn đúng
✅ WebP + Thumbnail → production-ready

👉 Lưu ý:

Media table KHÔNG gắn trực tiếp post_id

Gắn bằng polymorphic (mediaable)

C. Analytics & Trending – PHẦN NÀY LÀ ĐIỂM CỘNG LỚN

🔥 Redis INCR + Scheduler sync → CHUẨN BÁO LỚN
🔥 Trending theo velocity → không phải dev nào cũng nghĩ ra

👉 Công thức đơn giản:

score = views_last_30min * 2 + views_last_6h


📌 Anh đánh giá phần này 9/10

D. Page Builder

✅ JSON-based layout → đúng hướng
✅ Drag & Drop bằng dnd-kit → hợp lý

👉 Lưu ý:

Versioning cho Page giống Post

Không render HTML từ DB (XSS risk)

4. Service Pattern – ĐÁNH GIÁ
✅ Hoàn toàn đồng ý

Controller mỏng

Business logic trong Service

Resource để format response

👉 Đây là cấu trúc senior-level Laravel

Gợi ý nâng cấp:
Services/
 ├── Post/
 │   ├── PublishPostService.php
 │   ├── SchedulePostService.php


👉 Khi dự án lớn, 1 service = 1 use case

5. Sprint Plan – RẤT THỰC TẾ

✅ Thứ tự đúng
✅ Không nhồi Analytics sớm
✅ Để UI/Page Builder cuối

👉 Anh chỉ chỉnh 1 điểm:

SEO sitemap + RSS nên làm từ Sprint 3

6. Tech Lead Tips – PASS
Tip	Đánh giá
Slug unique	✅
Response cache	✅
Policy	✅
CI/CD	✅

👉 Đây là checklist deploy production, không phải tutorial.

7. ĐÁNH GIÁ CUỐI – TECH LEAD KẾT LUẬN
🔥 Tổng thể: RẤT ỔN – CÓ THỂ TRIỂN KHAI NGAY

Không over-engineering

Không thiếu critical part

Phù hợp team 3–8 dev

Scale tốt đến hàng triệu view/ngày

Nếu anh là Tech Lead dự án này:

👉 Anh duyệt proposal này ✔️
👉 Chỉ yêu cầu chỉnh:

Tách users / authors

Bổ sung bảng view theo ngày

Chuẩn hóa service theo use-case