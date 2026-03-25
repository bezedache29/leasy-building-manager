FROM serversideup/php:8.4-fpm-nginx

# On passe en root juste pour installer Node.js (Alpine Linux utilise apk, pas apt-get)
USER root
RUN apk add --no-cache nodejs npm

# On repasse en www-data (utilisateur web securise)
USER www-data

# On copie tout le projet
COPY --chown=www-data:www-data . /var/www/html

# Installation des dependances PHP
RUN composer install --no-dev --optimize-autoloader

# Installation des dependances JS et compilation
RUN npm install --legacy-peer-deps && npm run build