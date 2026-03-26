FROM php:8.2-apache

# Cài đặt extension và dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql zip exif gd

# Bật rewrite module và headers module cho Apache
RUN a2enmod rewrite headers

# Cấu hình Apache — bao gồm CORS headers cấp Apache
# Đây là tuyến phòng thủ cuối cùng: nếu PHP crash, Apache vẫn gửi CORS headers
# để browser hiển thị lỗi thực sự thay vì "CORS policy" giả.
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Ghi file cấu hình CORS cho Apache (fallback safety net)
# Dùng COPY để tránh vấn đề escaping với printf và %{} trong shell
COPY cors.conf /etc/apache2/conf-available/cors.conf
RUN a2enconf cors

# Copy mã nguồn
COPY . /var/www/html

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# Cấp quyền lưu trữ cho Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Cài đặt thư viện
RUN composer install --no-dev --optimize-autoloader

# Chạy build script lúc container start (chạy migrate và start apache)
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 80
CMD ["apache2-foreground"]
