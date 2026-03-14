# Post Version History (Versioning)

Tài liệu này mô tả cơ chế lưu trữ và khôi phục các phiên bản của bài viết trong hệ thống **News Portal CMS**.

## 1. Mục tiêu
- **Lưu vết:** Theo dõi mọi thay đổi về nội dung, tiêu đề, ảnh đại diện của bài viết.
- **An toàn:** Cho phép khôi phục (Rollback) về bất kỳ phiên bản nào trong quá khứ.
- **Trách nhiệm:** Biết được ai là người thực hiện bản cập nhật đó.

## 2. Thiết kế Cơ sở dữ liệu

### Bảng `post_versions`
Bảng này lưu trữ snapshot của bài viết. Mỗi khi một bài viết được cập nhật, trạng thái *trước khi cập nhật* sẽ được lưu vào đây.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | |
| `post_id` | BigInt (FK) | Liên kết tới bảng `posts` |
| `title` | String | Tiêu đề tại phiên bản đó |
| `summary` | Text | Tóm tắt tại phiên bản đó |
| `content` | LongText | Nội dung HTML tại phiên bản đó |
| `thumbnail` | String | URL ảnh tại phiên bản đó |
| `user_id` | BigInt (FK) | Người thực hiện phiên bản này (Lấy từ `created_by` hoặc `updated_by`) |
| `created_at`| Timestamp | Thời điểm bản ghi phiên bản được tạo |

---

## 3. Luồng hoạt động (Workflow)

### A. Lưu phiên bản (Trigger)
- **Khi Update bài viết:** Trước khi lưu dữ liệu mới vào bảng `posts`, hệ thống sẽ lấy dữ liệu hiện tại (Snapshot cũ) và lưu vào `post_versions`.
- **Khi Xuất bản (Publish):** Lưu một bản snapshot để đánh dấu trạng thái bài viết lúc lên trang.

### B. Xem lịch sử (View History)
- **API:** `GET /api/admin/posts/{id}/versions`
- **Frontend:** Hiển thị danh sách các bản ghi từ bảng `post_versions` theo thời gian mới nhất lên đầu.

### C. Khôi phục (Restore)
- **API:** `POST /api/admin/posts/{id}/versions/{version_id}/restore`
- **Quy trình:**
    1. Lấy dữ liệu từ `post_versions` theo `version_id`.
    2. Cập nhật dữ liệu đó vào bảng `posts`.
    3. (Optional) Tạo một bản version mới để ghi nhận hành động Restore.

---

## 4. Giao diện người dùng (UI)
- Tại trang **Chỉnh sửa bài viết**, thêm Tab **"Lịch sử"**.
- Danh sách hiển thị: `Thời gian` | `Người sửa` | `Hành động (Xem/Khôi phục)`.
