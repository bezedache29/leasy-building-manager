FROM serversideup/php:8.4-fpm-nginx

# ROOT pour installer packages
USER root

# Node.js
RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ✅ Installer extensions PHP (ajout de l'extension gd pour Intervention Image)
RUN install-php-extensions intl zip opcache gd

# Revenir user sécurisé
USER www-data

# Copier projet
COPY --chown=www-data:www-data . /var/www/html

# Composer
RUN composer install --no-dev --optimize-autoloader

# Build front
RUN npm install --legacy-peer-deps && npm run build