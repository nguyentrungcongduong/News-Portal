# System Architecture - News Portal CMS

Tài liệu này giải thích tư duy thiết kế và cấu trúc kỹ thuật cốt lõi của dự án.

## 1. Tech Stack & Rationale (Lý do chọn lựa)

- **Backend: Laravel 12+**
    - Cung cấp tính năng Security, Eloquent ORM, và Policy Authorization cực kỳ mạnh mẽ cho CMS.
    - Ecosystem tốt (Spatie Permission, Cloudinary SDK).
- **Frontend: React + Ant Design**
    - React mang lại UI mượt mà (SPA), tốc độ cao cho dashboard.
    - Ant Design là bộ UI component chuẩn cho các trang quản trị (Admin Panel), mang lại cảm giác premium và chuyên nghiệp.
- **Media Storage: Cloudinary**
    - Giải quyết vấn đề lưu trữ ảnh, tự động tối ưu hóa dung lượng và định dạng (WebP).
- **Security: Laravel Sanctum + Policies**
    - Quản lý API Token và phân quyền chi tiết đến từng Resource.

## 2. Design Patterns

Dự án áp dụng các Pattern chuẩn để đảm bảo code sạch và dễ bảo trì:

### A. Service Pattern
Thay vì viết toàn bộ logic trong Controller, hệ thống sử dụng **Services** để xử lý Business Logic.
- *Lợi ích:* Dễ dàng viết Unit Test và tái sử dụng code ở nhiều nơi (API, Command, Job).
- *Ví dụ:* `PostService`, `CategoryService`.

### B. API Resource Pattern
Sử dụng `JsonResource` của Laravel để format dữ liệu trả về cho Frontend.
- *Lợi ích:* Tách biệt cấu trúc Database và cấu trúc API, dễ dàng bảo mật các trường nhạy cảm.
- *Ví dụ:* `PostListResource`.

### C. Policy Logic
Dùng Laravel Policies để quản lý quyền hạn (Authorization).
- *Ví dụ:* `PostPolicy` kiểm soát việc ai được phép Approve bài viết.

### D. Versioning Pattern (Snapshotting)
Để đảm bảo an toàn dữ liệu, hệ thống thực hiện lưu Snapshot trước mỗi lần cập nhật lớn hoặc thay đổi trạng thái quan trọng.
- *Lợi ích:* Cho phép Rollback và Audit log chi tiết.
- *Ví dụ:* `PostVersion` lưu lại toàn bộ tiêu đề, nội dung và ảnh cũ trước khi ghi đè dữ liệu mới.

## 3. Database Schema Highlights  

- **Soft Deletes:** Tất cả dữ liệu quan trọng như Bài viết, Chuyên mục đều dùng `SoftDeletes` để tránh mất mát dữ liệu do lỡ tay.
- **Many-to-Many:** Mối quan hệ giữa Bài viết (Posts) và Chuyên mục (Categories) được quản lý qua bảng trung gian để linh hoạt trong phân loại.

## 4. Frontend Structure

- **/src/pages:** Chứa các trang chính (PostList, CreatePost, MediaGallery).
- **/src/components:** Chứa các component tái sử dụng (TiptapEditor, MediaGalleryModal).
- **Glassmorphism Design:** Áp dụng phong cách thiết kế hiện đại với nhiều lớp bóng đổ và nền mờ để tạo cảm giác cao cấp.
