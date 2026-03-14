# Hướng dẫn Kiểm tra Module Page Builder

Hệ thống Page Builder đã được triển khai hoàn tất với đầy đủ tính năng Backend, Admin UI và Public Frontend. Dưới đây là các bước để kiểm tra và sử dụng.

## 1. Truy cập Admin Panel
- Đường dẫn: `http://localhost:5173/admin/pages`
- Tại đây bạn sẽ thấy danh sách các trang.

## 2. Tạo Trang Mới
1. Nhấn **"Tạo trang mới"**.
2. Nhập tiêu đề trang (ví dụ: "Về Chúng Tôi").
3. Bên trái là **Toolbar**, nhấn vào các block để thêm vào trang:
   - **Hero Banner**: Banner lớn đầu trang.
   - **Post List**: Hiển thị danh sách bài viết (có thể lọc theo category slug).
   - **Gallery**: Tạo album ảnh (Grid/Masonry).
   - **Text, Image, Video...**: Các block cơ bản.
4. **Sắp xếp**: Kéo thả icon bên trái mỗi block để thay đổi vị trí.
5. **Cài đặt Block**: Nhấn vào icon bánh răng ⚙️ trên block hoặc click trực tiếp vào block để mở thanh cài đặt bên phải. Tại đây bạn có thể upload ảnh, sửa nội dung, chỉnh màu sắc.

## 3. Cài đặt SEO
1. Nhấn nút **SEO** trên thanh công cụ phía trên.
2. Nhập Meta Title, Description và OG Image.
3. Xem trước hiển thị trên Google ngay bên dưới.

## 4. Lưu & Xuất bản
1. Nhấn **Lưu trang**.
2. Bật switch **Published** để công khai trang.

## 5. Xem Trang Public
1. Nhấn nút **Xem trước** (icon con mắt) trên thanh công cụ hoặc ở danh sách trang.
2. Trang sẽ mở ra ở URL: `http://localhost:3000/page/[slug-cua-ban]`.
3. Kiểm tra hiển thị của các block trên giao diện người dùng thực tế.

## 6. Tính năng Nâng cao
- **Versioning**: Mỗi lần lưu, một phiên bản mới được tạo. Bạn có thể xem lịch sử và khôi phục (Tính năng backend đã có, UI đang dùng bản mới nhất).
- **Duplicate**: Tại danh sách trang, nhấn icon Clone để nhân bản toàn bộ nội dung trang sang một trang nháp mới.

## Lưu ý về Block "Post List"
- Block này sẽ hiển thị **placeholder** trong trang Admin.
- Khi ra trang Public, nó sẽ **tự động fetch dữ liệu bài viết thật** từ API dựa trên cấu hình (Category, Số lượng bài) mà bạn đã chọn.
