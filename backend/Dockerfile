FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx supervisor curl git zip unzip \
    libpng-dev libjpeg-dev freetype-dev \
    mysql-client redis

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd bcmath opcache pcntl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/afrihub

COPY . .
RUN composer install --no-dev --optimize-autoloader
RUN cp .env.example .env && php artisan key:generate
RUN chown -R www-data:www-data storage bootstrap/cache
RUN php artisan storage:link

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
