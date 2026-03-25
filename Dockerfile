FROM serversideup/php:8.4-fpm-nginx

# Installation de Node.js (pour npm) et des dependances systeme (PDF, Images) en root
USER root
RUN apt-get update \
    && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y \
    nodejs \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip bcmath intl pdo_mysql exif \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copie du code (le .dockerignore filtrera le reste)
COPY --chown=www-data:www-data . /var/www/html

# Installation des dependances dans l'image
USER www-data
RUN composer install --no-dev --optimize-autoloader
RUN npm install --legacy-peer-deps && npm run build