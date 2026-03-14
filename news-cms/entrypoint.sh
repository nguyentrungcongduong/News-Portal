#!/usr/bin/env bash

# Chạy migration của Laravel
php artisan migrate --force

# Cấu hình tối ưu hoá (chỉ chạy cache khi production)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Khởi động dịch vụ web
exec "$@"
