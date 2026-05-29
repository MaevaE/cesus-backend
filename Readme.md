# 🗂️ CESUS – Backend API

> Système numérique de recensement de la population  
> Node.js · Express · PostgreSQL · Prisma · JWT

---

## 📋 Table des matières

- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Démarrage](#démarrage)
- [Tests](#tests)
- [Endpoints API](#endpoints-api)
- [Structure des fichiers](#structure-des-fichiers)

---

## ⚙️ Stack technique

| Technologie | Rôle |
|-------------|------|
| Node.js 18+ | Runtime JavaScript |
| Express.js | Framework HTTP |
| PostgreSQL | Base de données relationnelle |
| Prisma ORM | Accès base de données |
| JWT | Authentification (access + refresh token) |
| Bcrypt | Chiffrement des mots de passe |
| Joi | Validation des entrées |
| Winston | Logs structurés |
| Helmet | Sécurité HTTP headers |
| Jest + Supertest | Tests unitaires et d'intégration |
| XLSX | Export Excel/CSV |

---

## 🏗️ Architecture

```
src/
├── config/
│   ├── database.js       → Prisma client singleton
│   ├── jwt.js            → Génération/vérification tokens
│   └── logger.js         → Logger Winston
│
├── controllers/          → Reçoit req/res, délègue au service
│   ├── auth.controller.js
│   ├── zone.controller.js
│   ├── menage.controller.js
│   ├── individu.controller.js
│   ├── sync.controller.js
│   ├── stats.controller.js
│   └── export.controller.js
│
├── services/             → Logique métier pure (testable)
│   ├── auth.service.js
│   ├── zone.service.js
│   ├── menage.service.js
│   ├── individu.service.js
│   ├── sync.service.js
│   ├── stats.service.js
│   └── export.service.js
│
├── repositories/         → Accès base de données uniquement
│   ├── user.repository.js
│   ├── zone.repository.js
│   ├── menage.repository.js
│   └── individu.repository.js
│
├── middlewares/
│   ├── auth.middleware.js       → JWT + rôles
│   ├── error.middleware.js      → Gestion centralisée erreurs
│   ├── validate.middleware.js   → Validation Joi
│   └── rateLimiter.middleware.js
│
├── routes/
│   ├── auth.routes.js
│   ├── zone.routes.js
│   ├── menage.routes.js
│   ├── individu.routes.js
│   ├── sync.routes.js
│   ├── stats.routes.js
│   └── export.routes.js
│
├── validators/           → Schémas Joi par entité
│   ├── auth.validator.js
│   ├── zone.validator.js
│   ├── menage.validator.js
│   └── individu.validator.js
│
├── utils/
│   ├── AppError.js       → Classe d'erreur personnalisée
│   ├── ApiResponse.js    → Réponses standardisées
│   ├── pagination.js     → Helper pagination
│   └── generateCode.js   → Générateur codes ménages
│
├── app.js                → Configuration Express
└── server.js             → Point d'entrée

prisma/
├── schema.prisma         → Schéma base de données
└── seed.js               → Données initiales

tests/
├── auth.service.test.js
├── auth.routes.test.js
└── zone.service.test.js
```

---

## ✅ Prérequis

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** >= 9

---

## 🚀 Installation

### 1. Cloner / copier le projet

```bash
cd "C:\Users\ABC\Desktop\Stage\code propre\cesus-backend"
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier exemple
copy .env.example .env
```

Puis éditer `.env` avec vos valeurs (voir section suivante).

---

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Serveur
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Base de données PostgreSQL
DATABASE_URL="postgresql://postgres:VotreMotDePasse@localhost:5432/cesus_db?schema=public"

# JWT (utilisez des valeurs longues et aléatoires en production)
JWT_SECRET=cesus_jwt_secret_super_long_et_securise_2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=cesus_refresh_secret_super_long_2024
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logs
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 🗄️ Base de données

### 1. Créer la base PostgreSQL

```sql
-- Dans pgAdmin ou psql
CREATE DATABASE cesus_db;
```

### 2. Générer le client Prisma

```bash
npm run db:generate
```

### 3. Appliquer les migrations

```bash
npm run db:migrate
```

> Donnez un nom à la migration, ex : `init_cesus`

### 4. Injecter les données initiales

```bash
npm run db:seed
```

Cela crée :
- 3 rôles : ADMIN, AGENT, SUPERVISEUR
- 1 compte admin : `admin@cesus.cm` / `Admin@cesus2024`
- 1 compte agent : `agent1@cesus.cm` / `Agent@cesus2024`
- 2 zones de démonstration
- 1 campagne de recensement

### 5. (Optionnel) Explorer la base avec Prisma Studio

```bash
npm run db:studio
```

---

## ▶️ Démarrage

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

### Vérification

```bash
# Health check
curl http://localhost:5000/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "app": "CESUS API",
  "version": "1.0.0"
}
```

---

## 🧪 Tests

### Lancer tous les tests

```bash
npm test
```

### Avec couverture de code

```bash
npm test -- --coverage
```

---

## 📡 Endpoints API

**Base URL :** `http://localhost:5000/api/v1`

### 🔐 Authentification

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/auth/login` | Public | Connexion |
| POST | `/auth/register` | ADMIN | Créer un utilisateur |
| POST | `/auth/refresh` | Public | Renouveler le token |
| POST | `/auth/logout` | Authentifié | Déconnexion |
| GET | `/auth/me` | Authentifié | Profil connecté |
| PATCH | `/auth/change-password` | Authentifié | Changer mot de passe |

### 🗺️ Zones

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/zones` | Tous | Liste des zones |
| GET | `/zones/:id` | Tous | Détail d'une zone |
| POST | `/zones` | ADMIN | Créer une zone |
| PATCH | `/zones/:id` | ADMIN | Modifier une zone |
| DELETE | `/zones/:id` | ADMIN | Supprimer une zone |

### 🏠 Ménages

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/menages` | Tous | Liste des ménages |
| GET | `/menages/:id` | Tous | Détail avec individus |
| POST | `/menages` | ADMIN, AGENT | Créer un ménage |
| PATCH | `/menages/:id` | ADMIN, AGENT | Modifier un ménage |
| DELETE | `/menages/:id` | ADMIN | Supprimer un ménage |

### 👤 Individus

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/menages/:id/individus` | Tous | Individus d'un ménage |
| POST | `/menages/:id/individus` | ADMIN, AGENT | Ajouter un individu |
| PATCH | `/menages/:menageId/individus/:id` | ADMIN, AGENT | Modifier un individu |
| DELETE | `/menages/:menageId/individus/:id` | ADMIN | Supprimer un individu |

### 🔄 Synchronisation

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/sync` | AGENT, ADMIN | Sync données hors-ligne |

### 📊 Statistiques

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/stats/dashboard` | ADMIN, SUPERVISEUR | Dashboard complet |
| GET | `/stats/agents` | ADMIN | Progression des agents |
| GET | `/stats/zones/:zoneId` | ADMIN | Stats par zone |

### 📥 Export

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/export/menages?format=xlsx` | ADMIN | Export ménages |
| GET | `/export/individus?format=csv` | ADMIN | Export individus |
| GET | `/export/rapport` | ADMIN | Rapport complet multi-feuilles |

---

## 📦 Format des réponses

### Succès

```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

### Liste paginée

```json
{
  "success": true,
  "message": "Liste récupérée",
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Erreur

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": [ ... ]
}
```

---

## 🔒 Sécurité

- Mots de passe chiffrés avec **bcrypt** (salt 12)
- **JWT** avec access token (7j) + refresh token (30j, révocable)
- Rotation des refresh tokens à chaque renouvellement
- **Helmet** pour les headers HTTP sécurisés
- **Rate limiting** : 100 req/15min (général), 10 req/15min (auth)
- **CORS** configuré par variable d'environnement
- Soft delete sur toutes les entités sensibles
- Validation stricte de toutes les entrées avec **Joi**

---

## 📝 Principes SOLID respectés

| Principe | Implémentation |
|----------|---------------|
| **S** – Single Responsibility | Chaque classe (controller, service, repository) a une seule responsabilité |
| **O** – Open/Closed | `authorize(...roles)` extensible sans modification |
| **L** – Liskov | Les services sont substituables (injection de dépendances) |
| **I** – Interface Segregation | Validators séparés par entité |
| **D** – Dependency Inversion | Controllers dépendent des services, services dépendent des repositories |

---

## 👨‍💻 Développé pour

**Projet CESUS** – Digitalisation du recensement de la population  
Stack : Node.js · Express · PostgreSQL · Prisma · JWT  
Architecture : Clean Architecture · Principes SOLID# 🗂️ CESUS – Backend API

> Système numérique de recensement de la population  
> Node.js · Express · PostgreSQL · Prisma · JWT

---

## 📋 Table des matières

- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [Démarrage](#démarrage)
- [Tests](#tests)
- [Endpoints API](#endpoints-api)
- [Structure des fichiers](#structure-des-fichiers)

---

## ⚙️ Stack technique

| Technologie | Rôle |
|-------------|------|
| Node.js 18+ | Runtime JavaScript |
| Express.js | Framework HTTP |
| PostgreSQL | Base de données relationnelle |
| Prisma ORM | Accès base de données |
| JWT | Authentification (access + refresh token) |
| Bcrypt | Chiffrement des mots de passe |
| Joi | Validation des entrées |
| Winston | Logs structurés |
| Helmet | Sécurité HTTP headers |
| Jest + Supertest | Tests unitaires et d'intégration |
| XLSX | Export Excel/CSV |

---

## 🏗️ Architecture

```
src/
├── config/
│   ├── database.js       → Prisma client singleton
│   ├── jwt.js            → Génération/vérification tokens
│   └── logger.js         → Logger Winston
│
├── controllers/          → Reçoit req/res, délègue au service
│   ├── auth.controller.js
│   ├── zone.controller.js
│   ├── menage.controller.js
│   ├── individu.controller.js
│   ├── sync.controller.js
│   ├── stats.controller.js
│   └── export.controller.js
│
├── services/             → Logique métier pure (testable)
│   ├── auth.service.js
│   ├── zone.service.js
│   ├── menage.service.js
│   ├── individu.service.js
│   ├── sync.service.js
│   ├── stats.service.js
│   └── export.service.js
│
├── repositories/         → Accès base de données uniquement
│   ├── user.repository.js
│   ├── zone.repository.js
│   ├── menage.repository.js
│   └── individu.repository.js
│
├── middlewares/
│   ├── auth.middleware.js       → JWT + rôles
│   ├── error.middleware.js      → Gestion centralisée erreurs
│   ├── validate.middleware.js   → Validation Joi
│   └── rateLimiter.middleware.js
│
├── routes/
│   ├── auth.routes.js
│   ├── zone.routes.js
│   ├── menage.routes.js
│   ├── individu.routes.js
│   ├── sync.routes.js
│   ├── stats.routes.js
│   └── export.routes.js
│
├── validators/           → Schémas Joi par entité
│   ├── auth.validator.js
│   ├── zone.validator.js
│   ├── menage.validator.js
│   └── individu.validator.js
│
├── utils/
│   ├── AppError.js       → Classe d'erreur personnalisée
│   ├── ApiResponse.js    → Réponses standardisées
│   ├── pagination.js     → Helper pagination
│   └── generateCode.js   → Générateur codes ménages
│
├── app.js                → Configuration Express
└── server.js             → Point d'entrée

prisma/
├── schema.prisma         → Schéma base de données
└── seed.js               → Données initiales

tests/
├── auth.service.test.js
├── auth.routes.test.js
└── zone.service.test.js
```

---

## ✅ Prérequis

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **npm** >= 9

---

## 🚀 Installation

### 1. Cloner / copier le projet

```bash
cd "C:\Users\ABC\Desktop\Stage\code propre\cesus-backend"
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
# Copier le fichier exemple
copy .env.example .env
```

Puis éditer `.env` avec vos valeurs (voir section suivante).

---

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine :

```env
# Serveur
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Base de données PostgreSQL
DATABASE_URL="postgresql://postgres:VotreMotDePasse@localhost:5432/cesus_db?schema=public"

# JWT (utilisez des valeurs longues et aléatoires en production)
JWT_SECRET=cesus_jwt_secret_super_long_et_securise_2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=cesus_refresh_secret_super_long_2024
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logs
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 🗄️ Base de données

### 1. Créer la base PostgreSQL

```sql
-- Dans pgAdmin ou psql
CREATE DATABASE cesus_db;
```

### 2. Générer le client Prisma

```bash
npm run db:generate
```

### 3. Appliquer les migrations

```bash
npm run db:migrate
```

> Donnez un nom à la migration, ex : `init_cesus`

### 4. Injecter les données initiales

```bash
npm run db:seed
```

Cela crée :
- 3 rôles : ADMIN, AGENT, SUPERVISEUR
- 1 compte admin : `admin@cesus.cm` / `Admin@cesus2024`
- 1 compte agent : `agent1@cesus.cm` / `Agent@cesus2024`
- 2 zones de démonstration
- 1 campagne de recensement

### 5. (Optionnel) Explorer la base avec Prisma Studio

```bash
npm run db:studio
```

---

## ▶️ Démarrage

### Mode développement (avec rechargement automatique)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

### Vérification

```bash
# Health check
curl http://localhost:5000/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "app": "CESUS API",
  "version": "1.0.0"
}
```

---

## 🧪 Tests

### Lancer tous les tests

```bash
npm test
```

### Avec couverture de code

```bash
npm test -- --coverage
```

---

## 📡 Endpoints API

**Base URL :** `http://localhost:5000/api/v1`

### 🔐 Authentification

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/auth/login` | Public | Connexion |
| POST | `/auth/register` | ADMIN | Créer un utilisateur |
| POST | `/auth/refresh` | Public | Renouveler le token |
| POST | `/auth/logout` | Authentifié | Déconnexion |
| GET | `/auth/me` | Authentifié | Profil connecté |
| PATCH | `/auth/change-password` | Authentifié | Changer mot de passe |

### 🗺️ Zones

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/zones` | Tous | Liste des zones |
| GET | `/zones/:id` | Tous | Détail d'une zone |
| POST | `/zones` | ADMIN | Créer une zone |
| PATCH | `/zones/:id` | ADMIN | Modifier une zone |
| DELETE | `/zones/:id` | ADMIN | Supprimer une zone |

### 🏠 Ménages

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/menages` | Tous | Liste des ménages |
| GET | `/menages/:id` | Tous | Détail avec individus |
| POST | `/menages` | ADMIN, AGENT | Créer un ménage |
| PATCH | `/menages/:id` | ADMIN, AGENT | Modifier un ménage |
| DELETE | `/menages/:id` | ADMIN | Supprimer un ménage |

### 👤 Individus

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/menages/:id/individus` | Tous | Individus d'un ménage |
| POST | `/menages/:id/individus` | ADMIN, AGENT | Ajouter un individu |
| PATCH | `/menages/:menageId/individus/:id` | ADMIN, AGENT | Modifier un individu |
| DELETE | `/menages/:menageId/individus/:id` | ADMIN | Supprimer un individu |

### 🔄 Synchronisation

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/sync` | AGENT, ADMIN | Sync données hors-ligne |

### 📊 Statistiques

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/stats/dashboard` | ADMIN, SUPERVISEUR | Dashboard complet |
| GET | `/stats/agents` | ADMIN | Progression des agents |
| GET | `/stats/zones/:zoneId` | ADMIN | Stats par zone |

### 📥 Export

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| GET | `/export/menages?format=xlsx` | ADMIN | Export ménages |
| GET | `/export/individus?format=csv` | ADMIN | Export individus |
| GET | `/export/rapport` | ADMIN | Rapport complet multi-feuilles |

---

## 📦 Format des réponses

### Succès

```json
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... }
}
```

### Liste paginée

```json
{
  "success": true,
  "message": "Liste récupérée",
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Erreur

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "code": "ERROR_CODE",
  "details": [ ... ]
}
```

---

## 🔒 Sécurité

- Mots de passe chiffrés avec **bcrypt** (salt 12)
- **JWT** avec access token (7j) + refresh token (30j, révocable)
- Rotation des refresh tokens à chaque renouvellement
- **Helmet** pour les headers HTTP sécurisés
- **Rate limiting** : 100 req/15min (général), 10 req/15min (auth)
- **CORS** configuré par variable d'environnement
- Soft delete sur toutes les entités sensibles
- Validation stricte de toutes les entrées avec **Joi**

---

## 📝 Principes SOLID respectés

| Principe | Implémentation |
|----------|---------------|
| **S** – Single Responsibility | Chaque classe (controller, service, repository) a une seule responsabilité |
| **O** – Open/Closed | `authorize(...roles)` extensible sans modification |
| **L** – Liskov | Les services sont substituables (injection de dépendances) |
| **I** – Interface Segregation | Validators séparés par entité |
| **D** – Dependency Inversion | Controllers dépendent des services, services dépendent des repositories |

---

## 👨‍💻 Développé pour

**Projet CESUS** – Digitalisation du recensement de la population  
Stack : Node.js · Express · PostgreSQL · Prisma · JWT  
Architecture : Clean Architecture · Principes SOLID