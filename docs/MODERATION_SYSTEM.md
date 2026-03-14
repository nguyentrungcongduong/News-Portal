# Hệ Thống Kiểm Duyệt Nội Dung (Moderation & Anti-Spam System)

Tài liệu này mô tả chi tiết các tính năng, cơ chế vận hành và kiến trúc của hệ thống kiểm duyệt bình luận tự động và thủ công đã được triển khai.

## 1. Tổng Quan Hệ Thống
Hệ thống được thiết kế theo mô hình **Hybrid Moderation (Kiểm duyệt hỗn hợp)**, kết hợp giữa lọc tự động (Rule-based) và phê duyệt thủ công (Human-in-the-loop) dựa trên điểm tin cậy của người dùng.

### Các trạng thái nội dung (Comment Status):
- `pending`: Chờ duyệt (Mặc định cho người dùng mới/vãng lai).
- `approved`: Đã duyệt (Hiển thị công khai).
- `reported`: Bị báo cáo (Đang chờ xem xét vi phạm).
- `hidden`: Đã ẩn (Vi phạm nặng hoặc bị auto-hide).
- `rejected`: Từ chối (Admin từ chối cho phép hiển thị).

---

## 2. Các Lớp Bảo Vệ (Security Layers)

### Lớp 1: Spam Detection Service (Tự động)
Hệ thống tự động phân loại bình luận ngay khi người dùng gửi bài dựa trên các quy tắc:
- **Keyword Blacklist**: Tự động ẩn (`hidden`) nếu chứa từ khóa cấm (casino, bet, xxx, lừa đảo...).
- **Link Protection**: Tự động ẩn nếu chứa quá 2 đường dẫn (URL).
- **Duplicate Check**: Chống spam nội dung lặp lại.
- **Rate Limiting**: Giới hạn tần suất gửi bài (tối đa 3 bình luận/2 phút).

### Lớp 2: Trust Score System (Điểm tin cậy)
Mô hình tự động hóa dựa trên uy tín của người dùng:
- **Ngưỡng tin cậy (10 điểm)**:
    - Nếu `trust_score < 10`: Bình luận luôn vào trạng thái `pending`.
    - Nếu `trust_score >= 10`: Bình luận được tự động `approved` (nếu vượt qua Lớp 1).
- **Cơ chế cộng/trừ điểm**:
    - Được duyệt (`approve`): **+1 điểm**.
    - Bị từ chối (`reject`): **-5 điểm**.
    - Bị báo cáo (`report`): Điểm tin cậy sẽ giảm nếu Admin xác nhận vi phạm.

### Lớp 3: Community Reporting (Báo cáo cộng đồng)
- **Cột mốc 3 báo cáo**: Chuyển trạng thái sang `reported`, đẩy lên khu vực ưu tiên của Admin.
- **Cột mốc 5 báo cáo**: Tự động ẩn (`hidden`) để bảo vệ trang báo trước khi Admin vào xử lý.

---

## 3. Quản Trị Viên (Admin Capabilities)

### Moderation Dashboard (Trung tâm kiểm soát)
Giao diện quản trị tập trung cung cấp:
- **Overview Stats**: Số liệu thời gian thực về bình luận chờ duyệt, báo cáo, và người dùng bị chặn.
- **Moderation Logs**: Nhật ký hành động của Admin (Audit Trail) để đảm bảo tính minh bạch.
- **Comment Analytics**:
    - **Top Controversial Posts**: Những bài viết có nhiều báo cáo nhất.
    - **Risky Users**: Danh sách người dùng thường xuyên vi phạm hoặc có điểm tin cậy âm.
    - **Heatmap**: Xu hướng thảo luận và rủi ro.

### Thông báo Real-time
Admin nhận thông báo real-time qua Notification Bell khi:
- Có bình luận mới chờ duyệt.
- Có nội dung bị cộng đồng báo cáo.
- Hệ thống tự động khóa tài khoản (Auto-block).

### Công cụ xử lý nhanh
- **Quick Action**: Approve, Reject, Hide, Delete trong 1 click.
- **User Management**: Block/Unblock tài khoản ngay tại giao diện bình luận.
- **Spam Reason**: Hiển thị rõ lý do tại sao hệ thống gắn cờ bình luận (ví dụ: "Chứa từ khóa cấm").

---

## 4. Chống Spam & Tấn Công (Anti-Abuse)
- **Auto-Block Rule**: Nếu một tài khoản có **3 bình luận bị hệ thống xác định là Spam** (`status = hidden`), tài khoản đó sẽ bị hệ thống **tự động khóa vĩnh viễn**.
- **IP Tracking**: Ghi lại địa chỉ IP để chống spam hàng loạt từ bot.

---

## 5. Hướng dẫn vận hành dành cho Admin
1. **Buổi sáng**: Kiểm tra mục **"Bình luận chờ duyệt"** trong Moderation Dashboard để duyệt nhanh các User tích cực.
2. **Ưu tiên**: Xử lý các bình luận trong mục **"Bị báo cáo"** để tránh tranh cãi leo thang.
3. **Theo dõi**: Quan sát bảng **"Risky Users"** để chặn sớm các tài khoản có dấu hiệu bot hoặc phá hoại.
