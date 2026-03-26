#!/usr/bin/env bash

# Xóa cache cũ và nhận cấu hình mới từ Environment của Render
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Chạy migration (bắt buộc)
php artisan migrate --force

# Chạy seeder — không bắt buộc: lỗi seeder không được dừng deployment
# Seeder chỉ tạo dữ liệu mẫu; nếu thất bại, server vẫn phải khởi động
php artisan db:seed --force || echo "[entrypoint] Seeder failed (non-fatal) — continuing startup"

# Cấu hình tối ưu hoá lại
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Thêm ServerName để tránh cảnh báo FQDN của Apache
echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Khởi động dịch vụ web
exec "$@"
