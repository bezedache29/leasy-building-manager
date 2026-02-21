# 🏢 **Leasy**

> _Leasy est une application web moderne conçue sur mesure pour simplifier et automatiser la gestion des loyers et la répartition des charges pour les appartements d'un immeuble spécifique._

![PHP](https://img.shields.io/badge/PHP-8.5-777bb4?style=for-the-badge&logo=php)
![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)

---

### 🛠️ **Stack Technique**

- **Backend :** PHP 8.5 & Laravel 12.
- **Frontend :** React & TypeScript (Vite).
- **Infrastructure :** Docker (Laravel Sail) & Reverse Proxy Traefik local.

---

### 📋 **Prérequis**

Pour lancer ce projet en local, vous devez avoir :

1. **Docker Desktop** installé et lancé.
2. Un **reverse proxy Traefik** local configuré avec un certificat SSL Wildcard (`*.dev.localhost`).

---

### 🚀 **Démarrage Rapide**

1. **Cloner le dépôt :**

    ```bash
    git clone git@github.com:bezedache29/leasy-building-manager.git
    cd leasy-building-manager
    ```

2. **Installer les dépendances PHP (Dossier Vendor) :**
    - On utilise un conteneur temporaire pour installer Laravel sans PHP 8.5 local :

    ```bash
    docker run --rm \
        -u "$(id -u):$(id -g)" \
        -v "$(pwd):/var/www/html" \
        -w /var/www/html \
        laravelsail/php85-composer:latest \
        composer install --ignore-platform-reqs
    ```

3. **Configurer l'environnement :**
    - Copier le fichier : `cp .env.example .env`
    - Vérifier que `APP_DOMAIN` est bien renseigné (ex: `leasy.dev.localhost`).

4. **Vérification SSL pour Vite (HMR) 🔐 :**
    - Avant de démarrer, assurez-vous que votre fichier `vite.config.js` pointe bien vers les certificats de votre infrastructure Traefik.
    - **Chemins à vérifier :** `/etc/traefik/certs/wildcard-key.pem` et `/etc/traefik/certs/wildcard.pem`.
    - **Note :** La configuration doit utiliser `loadEnv` pour récupérer dynamiquement le `APP_DOMAIN` du fichier `.env`.

5. **Démarrer les conteneurs (via Sail) :**

    ```bash
    ./vendor/bin/sail up -d
    ```

6. **Initialisation de l'application :**

    ```bash
    ./vendor/bin/sail artisan key:generate
    ./vendor/bin/sail artisan migrate:fresh --seed
    ```

7. **Lancer le serveur de développement Frontend :**
    ```bash
    ./vendor/bin/sail npm install
    ./vendor/bin/sail npm run dev
    ```

---

### 🔗 **Accès Utiles**

| Service                  | URL                                | Note                        |
| :----------------------- | :--------------------------------- | :-------------------------- |
| **🌍 Application**       | `https://leasy.dev.localhost`      | -                           |
| **🗄️ Base de données**   | `https://pma-leasy.dev.localhost`  | Host: `mysql`, User: `sail` |
| **📨 Mailpit**           | `https://mail.leasy.dev.localhost` | Interception d'emails       |
| **🚦 Traefik Dashboard** | `http://localhost:8080`            | Suivi des routeurs          |

---

### 🏗️ **Fonctionnalités**

- 🏢 **Gestion des appartements** : Configuration des lots (surface, tantièmes, etc.).
- 💶 **Suivi des loyers** : Suivi des paiements et calcul de répartition des charges.
- 👥 **Locataires :** Gestion des baux et historique d'occupation.

---

### 💡 **Astuce Docker (WSL2)**

Si erreur `error getting credentials` au démarrage :

```bash
sed -i 's/"credsStore": "desktop.exe"/"credsStore": ""/g' ~/.docker/config.json
```

---

### 👏 **Crédits**

- **Développement & Conception :** [@bezedache29](https://github.com/bezedache29)
