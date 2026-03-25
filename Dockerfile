FROM serversideup/php:8.4-fpm-nginx

ENV WEB_DOCUMENT_ROOT=/var/www/html/public

# Installation des dépendances système pour les PDF et images
USER root
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd zip bcmath intl pdo_mysql exif

# Copie du code
COPY --chown=www-data:www-data . /var/www/html

# Installation de Composer et NPM
USER www-data
RUN composer install --no-dev --optimize-autoloader
# On utilise ta règle spécifique pour NPM
RUN npm install --legacy-peer-deps && npm run build