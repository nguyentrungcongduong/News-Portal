# Post Workflow & Lifecycle

Tài liệu này mô tả chi tiết luồng vòng đời của một bài viết trong hệ thống **News Portal CMS**, từ lúc khởi tạo đến khi được lưu trữ.

## 1. Các trạng thái (Statuses)

| Trạng thái | Mã hiệu | Mô tả | Hiển thị Public |
| :--- | :--- | :--- | :--- |
| **Bản nháp** | `draft` | Bài viết đang trong quá trình soạn thảo, chưa hoàn thiện. | Không |
| **Chờ duyệt** | `pending` | Author đã hoàn thành và gửi yêu cầu phê duyệt đến Editor. | Không |
| **Xuất bản** | `published` | Bài viết đã được duyệt và hiển thị công khai trên website. | **Có** |
| **Lưu trữ** | `archived` | Bài viết đã bị gỡ xuống hoặc lưu kho, không hiển thị public. | Không |

---

## 2. Phân quyền Workflow (Role-based)

Hệ thống sử dụng **Role-based Access Control (RBAC)** để kiểm soát các bước trong Workflow:

### 🟢 Author (Phóng viên)
- **Hành động:** Tạo bài mới, Sửa bài nháp.
- **Quy trình:** `Draft` ➔ `Pending` (Gửi duyệt).
- **Hạn chế:** Không được tự ý `Publish` (Xuất bản) bài viết.

### 🔵 Editor (Biên tập viên)
- **Hành động:** Review bài viết của Author.
- **Quy trình:** `Pending` ➔ `Published` (Phê duyệt) hoặc `Published` ➔ `Archived` (Gỡ bài).
- **Hạn chế:** Thường chỉ tập trung vào kiểm soát nội dung và xuất bản.

### 🔴 Admin (Quản trị viên)
- **Hành động:** Toàn quyền (Full access).
- **Quy trình:** Có thể nhảy vọt trạng thái hoặc can thiệp vào bất kỳ bước nào.

---

## 3. Bảng chuẩn: Hành động theo Role & Status

Hệ thống UI và Backend sẽ hiển thị các nút hành động dựa trên ma trận sau:

| Role | Status hiện tại | Nút Action hiển thị | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **Author** | `draft` | **Lưu nháp** / **Gửi duyệt** | Lưu nội dung hoặc yêu cầu Editor duyệt |
| **Author** | `pending` | (Chỉ xem) | Đang chờ xét duyệt, không được sửa |
| **Editor** | `pending` | **Duyệt & Xuất bản** | Phê duyệt nội dung để công khai |
| **Admin** | `draft` | **Lưu nháp** / **Xuất bản ngay** | Admin có quyền bypass bước gửi duyệt |
| **Admin** | `pending` | **Duyệt & Xuất bản** | Quyền duyệt bài của Admin |
| **Admin** | `published`| **Gỡ bài** | Chuyển bài đang đăng vào lưu trữ |

---

## 4. Luồng kỹ thuật (Technical Flow)

### A. Từ Nháp chuyển sang Chờ duyệt
- **API:** `POST /api/admin/posts/{id}/submit`
- **Điều kiện:** Bài viết phải ở trạng thái `draft`.
- **Hành động:** Cập nhật `status = pending`.

### B. Phê duyệt & Xuất bản
- **API:** `POST /api/admin/posts/{id}/approve`
- **Điều kiện:**
    - Bài viết phải ở trạng thái `pending`.
    - Phải có đủ `title` và `content`.
- **Hành động:**
    - Cập nhật `status = published`.
    - Ghi nhận thời gian vào `published_at`.

### C. Gỡ bài & Lưu trữ
- **API:** `POST /api/admin/posts/{id}/archive`
- **Điều kiện:** Bài viết đang ở trạng thái `published`.
- **Hành động:** Cập nhật `status = archived`.

---

## 4. UI Indicators
Trong Admin UI, trạng thái được nhận diện qua màu sắc:
- `DRAFT`: **Yellow/Orange**
- `PENDING`: **Blue**
- `PUBLISHED`: **Green**
- `ARCHIVED`: **Gray/Red**
