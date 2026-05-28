FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    nginx supervisor curl git zip unzip \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    mysql-client redis

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql gd bcmath opcache pcntl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/afrihub

COPY . .
RUN composer update --no-dev --optimize-autoloader --no-interaction
RUN cp .env.example .env && php artisan key:generate
RUN chown -R www-data:www-data storage bootstrap/cache
RUN php artisan storage:link

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
