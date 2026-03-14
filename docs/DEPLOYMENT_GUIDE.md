# 🚀 Hướng Dẫn Deploy Full-Stack News Portal (Vercel, Render, Neon)

Hướng dẫn này sẽ giúp bạn deploy hoàn chỉnh dự án lên môi trường production với stack:
- **Database:** Neon (PostgreSQL)
- **Backend API:** Render (Laravel)
- **Frontend (Public + Admin):** Vercel (Next.js & Vite/React)

---

## Phần 1: Thiết lập Database trên Neon (PostgreSQL)

Neon cung cấp serverless PostgreSQL rất nhanh và miễn phí.

1. Truy cập [Neon.tech](https://neon.tech/) đăng nhập hoặc đăng ký tài khoản.
2. Tạo project mới (New Project):
   - **Name:** news-portal-db
   - **Postgres Version:** 15 hoặc 16
   - **Region:** Chọn khu vực gần bạn (ví dụ: Singapore / ap-southeast-1)
3. Khi project được tạo, bạn sẽ thấy giao diện **Connection Details**.
4. Chọn **Laravel** trong phần kết nối. Bạn sẽ thấy một string có dạng:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech
   DB_PORT=5432
   DB_DATABASE=neondb
   DB_USERNAME=neondb_owner
   DB_PASSWORD=your_password
   DB_SSLMODE=require
   ```
5. **Lưu lại các thông số này** để cài đặt cho Backend Laravel ở bước sau.

---

## Phần 2: Deploy Backend Laravel lên Render 

Render hỗ trợ native cho PHP (Laravel).

### 2.1. Chuẩn bị mã nguồn
Tạo một file có tên `render-build.sh` trong thư mục `news-cms/` với nội dung sau:
```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

# Cài đặt thư viện PHP
composer install --no-dev --optimize-autoloader

# Chạy migrate để tạo database (cần kết nối Neon ở đây)
php artisan migrate --force

# Tối ưu hoá cache cho Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

- Chạy lệnh `chmod +x render-build.sh` trong terminal hoặc push sẵn lên Git để Render có quyền chạy file.
- Đẩy toàn bộ source code lên kho chứa (GitHub, GitLab).

### 2.2. Khởi tạo Web Service trên Render
1. Truy cập [Render.com](https://render.com/) và tạo tài khoản.
2. Tạo mới: **New > Web Service**.
3. Kết nối với tài khoản GitHub và chọn repository chứa dự án `News-Portal`.
4. Cấu hình dịch vụ (Service Settings):
   - **Name:** `news-portal-api`
   - **Root Directory:** `news-cms` *(Quan trọng: Bạn phải set Root Directory đúng thư mục laravel)*
   - **Environment:** `PHP`
   - **Build Command:** `./render-build.sh`
   - **Start Command:** `heroku-php-apache2 public/` *(hoặc `heroku-php-nginx public/`)*
5. Thay vì bấm Deploy, kéo xuống và mở phần **Environment Variables**. Thêm các biến sau:
   - `APP_NAME` = `NewsPortal`
   - `APP_ENV` = `production`
   - `APP_KEY` = *(Lấy APP_KEY hiện tại trong file .env ở local của bạn)*
   - `APP_DEBUG` = `false`
   - `APP_URL` = *(Ban đầu bạn có thể điền tạm HTTPS URL mà render cấp, ví dụ: https://news-portal-api.onrender.com)*
   - `FRONTEND_URL` = *(Chút nữa deploy Vercel xong sẽ quay lại điền, ví dụ: https://news-portal.vercel.app)*
   - `SANCTUM_STATEFUL_DOMAINS` = *(Domain của Vercel)*
   - `SESSION_DRIVER` = `cookie` hoặc `database`
   - `DB_CONNECTION` = `pgsql`
   - `DB_HOST` = *(Host từ Neon)*
   - `DB_PORT` = `5432`
   - `DB_DATABASE` = *(Database name từ Neon)*
   - `DB_USERNAME` = *(User từ Neon)*
   - `DB_PASSWORD` = *(Password từ Neon)*
6. Bấm **Create Web Service**. Chờ vài phút để Render build và cài đặt thư viện. Khi hoàn thành bạn sẽ lấy được Domain backend API.

---

## Phần 3: Deploy Frontend (Public) lên Vercel

Vercel là nền tảng tốt nhất cho Next.js. 

### 3.1 Cấu hình dự án 
1. Mở trang chủ Vercel [Vercel.com](https://vercel.com/) và đăng nhập.
2. Bấm **Add New... > Project** và chọn repository chứa toàn bộ mã nguồn `News-Portal`.
3. Trong giao diện cấu hình Deploy:
   - **Project Name:** `news-portal`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend/` *(Quan trọng: Chọn thư mục chứa app Next.js)*
4. Mở phần **Environment Variables** và nhập:
   - `NEXT_PUBLIC_API_URL` = `https://<ten-backend-tren-render>.onrender.com/api` (URL backend mà bạn có được từ bước 2)
   - Nếu bạn có bất kỳ biến môi trường nào ở `frontend/.env.local` thì add tương ứng vào đây.
5. Bấm **Deploy**. Sau khoảng 1-2 phút bạn sẽ nhận được Link web chạy frontend chính.

---

## Phần 4: Deploy Admin UI (React/Vite) lên Vercel

Nếu dự án có phần Admin UI nằm rời ở `frontend/admin-ui`, bạn cũng sẽ host nó lên Vercel như một trang web độc lập.

1. Bấm quay lại trang chủ Vercel và chọn **Add New... > Project**.
2. Vẫn chọn chung repository đó nhưng chọn cấu hình như sau:
   - **Project Name:** `news-portal-admin`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend/admin-ui/` *(Trỏ vào thư mục của Admin UI)*
3. Mở phần **Environment Variables**:
   - `VITE_API_URL` (hoặc tên tương ứng bạn dùng trong admin) = `https://<ten-backend-tren-render>.onrender.com/api`
   - `VITE_PUBLIC_URL` = `https://news-portal-admin.vercel.app` (Hoặc URL vercel cấp)
4. Bấm **Deploy**. Admin App sẽ được host tại một domain riêng của Vercel.

---

## Phần 5: Liên Kết Dữ Liệu Lần Cuối (Update `.env` trên Render)

Khi bạn đã có URL của *Frontend Public* và *Frontend Admin* từ Vercel, hãy vào Dashboard của Render > Web Service Laravel > Environment để cập nhật:

- `FRONTEND_URL` = `https://domain-vercel-chinh.vercel.app,https://domain-vercel-admin.vercel.app`
- `SANCTUM_STATEFUL_DOMAINS` = `domain-vercel-chinh.vercel.app,domain-vercel-admin.vercel.app` (Bỏ https)
- `CORS_ALLOWED_ORIGINS` = `https://domain-vercel-chinh.vercel.app,https://domain-vercel-admin.vercel.app`

Restart lại server Render để nhận biến mới. Bạn đã deploy dự án xong xuôi! 🚀
