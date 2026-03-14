#!/usr/bin/env bash

# Xóa cache cũ và nhận cấu hình mới từ Environment của Render
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Chạy migration và seeder của Laravel
php artisan migrate --force
php artisan db:seed --force

# Cấu hình tối ưu hoá lại
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Khởi động dịch vụ web
exec "$@"
