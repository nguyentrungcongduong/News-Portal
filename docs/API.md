# API Documentation - News Portal CMS

Tài liệu này định nghĩa các Endpoint và cấu trúc dữ liệu cho hệ thống News Portal.

## 1. Nguyên tắc chung
- **Base URL**: `http://127.0.0.1:8000/api`
- **Format**: JSON, Snake_case.
- **Authentication**: Laravel Sanctum (Bearer Token).

---

## 2. Bài viết (Posts - Admin)

| Method | Endpoint | Description | Status Code |
|:--- |:--- |:--- |:--- |
| **GET** | `/admin/posts` | Danh sách bài viết (có phân trang, filter) | 200 |
| **GET** | `/admin/posts/{id}` | Chi tiết bài viết để chỉnh sửa | 200 / 404 |
| **POST** | `/admin/posts` | Tạo bài viết mới (mặc định status = draft) | 201 |
| **PUT** | `/admin/posts/{id}` | Cập nhật thông tin bài viết | 200 |
| **DELETE**| `/admin/posts/{id}` | Xóa bài viết (Soft Delete) | 200 |

### 🚀 Workflow Endpoints (Nghiệp vụ Tòa soạn)
Các API chuyên biệt để thay đổi trạng thái bài viết:

| Method | Endpoint | Description | Điều kiện |
|:--- |:--- |:--- |:--- |
| **POST** | `/admin/posts/{id}/submit` | Gửi bài cho Biên tập viên duyệt | Status hiện tại phải là `draft` |
| **POST** | `/admin/posts/{id}/approve` | Phê duyệt và Xuất bản lên web | Status hiện tại phải là `pending` |
| **POST** | `/admin/posts/{id}/archive` | Gỡ bài viết đã đăng | Status hiện tại phải là `published` |

---

## 3. Media (Hình ảnh)

| Method | Endpoint | Description | Request |
|:--- |:--- |:--- |:--- |
| **POST** | `/admin/media/upload` | Upload ảnh lên Cloudinary | `file` |
| **GET** | `/admin/media` | Thư viện ảnh (Gallery) | `?page=1&q=search_term` |
| **DELETE**| `/admin/media/{id}` | Xóa ảnh khỏi Cloudinary & DB | - |

---

## 4. Danh mục (Categories)

| Method | Endpoint | Description |
|:--- |:--- |:--- |
| **GET** | `/admin/categories` | Lấy danh sách chuyên mục cho Select box |

---

## 5. Ví dụ Response (JSON)

### GET /admin/posts (List)
```json
{
    "data": [
        {
            "id": 1,
            "title": "Hệ thống AI mới của Google",
            "categories": [
                { "id": 5, "name": "Công nghệ" }
            ],
            "status": "published",
            "author": { "name": "Admin" },
            "updated_at": "2026-01-15 17:00:00"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 3,
        "total": 30
    }
}
---

## 6. Kiểm duyệt Bình luận (Moderation - Admin)

| Method | Endpoint | Description |
|:--- |:--- |:--- |
| **GET** | `/admin/comments` | Danh sách bình luận (filter: status, keyword) |
| **PATCH** | `/admin/comments/{id}/approve` | Duyệt bình luận (+1 Trust Score) |
| **PATCH** | `/admin/comments/{id}/reject` | Từ chối bình luận (-5 Trust Score) |
| **PATCH** | `/admin/comments/{id}/hide` | Ẩn bình luận khỏi public |
| **PATCH** | `/admin/comments/{id}/ignore` | Bỏ qua các báo cáo vi phạm |
| **DELETE** | `/admin/comments/{id}` | Xóa vĩnh viễn bình luận |
| **POST** | `/admin/comments/{id}/block-user` | Khóa tài khoản người dùng viết comment |

## 7. Moderation Dashboard & Analytics

| Method | Endpoint | Description |
|:--- |:--- |:--- |
| **GET** | `/admin/moderation/overview` | Thống kê tổng quan rủi ro |
| **GET** | `/admin/moderation/logs` | Nhật ký hành động của Admin |
| **GET** | `/admin/moderation/comment-analytics` | Phân tích bài viết gây tranh cãi & user rủi ro |
