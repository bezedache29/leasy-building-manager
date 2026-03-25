FROM serversideup/php:8.4-fpm-nginx

# On passe en root pour installer Node.js (Système Ubuntu)
USER root
RUN apt-get update \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# On repasse en utilisateur web sécurisé
USER www-data

# On copie tout le projet
COPY --chown=www-data:www-data . /var/www/html

# Installation des dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Installation des dépendances JS et compilation
RUN npm install --legacy-peer-deps && npm run build