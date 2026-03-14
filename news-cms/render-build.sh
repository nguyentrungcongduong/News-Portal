#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

echo "Running database migrations..."
# This requires DB connection env vars to be set on Render
php artisan migrate --force

echo "Optimizing application for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Linking storage..."
php artisan storage:link || true

echo "Build process completed!"
