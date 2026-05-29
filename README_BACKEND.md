# CESUS - Backend API

Backend Express/Prisma pour le MVP CESUS, connecte a l'application mobile React Native Expo.

## Architecture

- `src/app.js` : configuration Express, securite, parsing, routes et erreurs globales.
- `src/server.js` : connexion PostgreSQL puis demarrage HTTP.
- `src/config` : Prisma, JWT et logger.
- `src/middleware` : authentification JWT, autorisations, validation Joi, erreurs, rate limit.
- `src/modules/auth` : login, refresh token, logout, profil, inscription admin et auto-inscription agent mobile.
- `src/modules/agents` : endpoints mobiles pour profil agent, dashboard, mission et GPS.
- `src/modules/zones` : CRUD zones de recensement.
- `src/modules/menages` : CRUD menages, compatible payload mobile.
- `src/modules/individus` : CRUD individus direct et imbrique sous menage.
- `src/modules/synchro` : synchronisation offline mobile.
- `src/modules/stats` : statistiques dashboard admin/superviseur.
- `src/modules/export` : exports CSV/XLSX.
- `src/db/schema.prisma` : schema PostgreSQL.
- `src/tests` : tests unitaires, integration API et compatibilite mobile.

## Installation

```bash
cd "C:\Users\ABC\Desktop\Stage\code propre\cesus-backend"
npm install
copy .env.example .env
```

Configurer `.env`, puis preparer Prisma :

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Demarrer :

```bash
npm run dev
# ou
npm start
```

Base URL locale :

```text
http://localhost:5000/api/v1
```

Alias compatible MVP :

```text
http://localhost:5000/api
```

Documentation Swagger :

```text
http://localhost:5000/api-docs
```

Pour Expo Android emulator, le frontend utilise par defaut :

```text
http://10.0.2.2:5000/api/v1
```

Pour un telephone physique, definir :

```bash
EXPO_PUBLIC_API_URL=http://ADRESSE_IP_DU_PC:5000/api/v1
```

## Variables D'Environnement

Voir `.env.example`.

Variables obligatoires :

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

Variables recommandees :

- `PORT`
- `API_PREFIX`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`

## Format Standard Des Reponses

Succes :

```json
{
  "success": true,
  "message": "Operation reussie",
  "data": {}
}
```

Liste paginee :

```json
{
  "success": true,
  "message": "Liste recuperee",
  "data": [],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

Erreur :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

## Authentification

Le backend attend :

```http
Authorization: Bearer <accessToken>
```

Le login retourne :

```json
{
  "success": true,
  "message": "Connexion reussie",
  "data": {
    "user": {
      "id": "uuid",
      "email": "agent1@cesus.cm",
      "role": { "nom": "AGENT" },
      "agent": { "id": "uuid" }
    },
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

## Endpoints

### Health

`GET /health`

Reponse :

```json
{
  "status": "OK",
  "app": "CESUS API",
  "version": "1.0.0"
}
```

### Auth

`POST /api/v1/auth/login`

Body web :

```json
{ "email": "agent1@cesus.cm", "motDePasse": "Agent@cesus2024" }
```

Body mobile accepte :

```json
{ "email": "agent1@cesus.cm", "password": "Agent@cesus2024" }
```

`POST /api/v1/auth/register-agent`

Auto-inscription agent mobile.

```json
{
  "name": "Jean Mbarga",
  "email": "jean@cesus.cm",
  "telephone": "+237699000000",
  "motDePasse": "Secret123"
}
```

`POST /api/v1/auth/register`

Reserve admin. Cree un utilisateur avec `roleId`.

`POST /api/v1/auth/refresh`

```json
{ "refreshToken": "jwt" }
```

`POST /api/v1/auth/logout`

`GET /api/v1/auth/me`

`PATCH /api/v1/auth/change-password`

```json
{
  "ancienMotDePasse": "Secret123",
  "nouveauMotDePasse": "NewSecret123"
}
```

### Agents Mobile

`GET /api/v1/agents/me`

Profil agent connecte.

`GET /api/v1/agents/me/dashboard`

Reponse :

```json
{
  "success": true,
  "data": {
    "population": 0,
    "menages": 0,
    "zones": 1,
    "aujourdHui": 0,
    "couverture": 0,
    "zone": {}
  }
}
```

`GET /api/v1/agents/me/mission`

Mission/zone assignee pour l'ecran GPS.

`PATCH /api/v1/agents/me/location`

```json
{ "latitude": 3.8936, "longitude": 11.5167 }
```

### Zones

`GET /api/v1/zones`

`GET /api/v1/zones/:id`

`POST /api/v1/zones` admin :

```json
{
  "nom": "Zone A - Centre",
  "region": "Centre",
  "departement": "Yaounde",
  "latitude": 3.8936,
  "longitude": 11.5167
}
```

`PATCH /api/v1/zones/:id`

`DELETE /api/v1/zones/:id`

### Menages

`GET /api/v1/menages`

`GET /api/v1/menages/:id`

`POST /api/v1/menages`

Payload mobile accepte :

```json
{
  "region": "Centre",
  "ville": "Yaounde",
  "quartier": "Bastos",
  "zone": "Zone A - Centre",
  "chefMenage": "Paul Mvondo",
  "telephone": "699000000",
  "nbPersonnes": 3,
  "nbHommes": 1,
  "nbFemmes": 1,
  "nbEnfants": 1,
  "typeHabitation": "Maison individuelle",
  "nbPieces": 3,
  "sourceEau": "Forage",
  "accesElectricite": "Oui",
  "typeToilettes": "Interieures",
  "profession": "Agriculteur",
  "revenu": "100000",
  "observations": "RAS"
}
```

Payload API classique accepte :

```json
{
  "nomChef": "Mvondo",
  "prenomChef": "Paul",
  "adresse": "Bastos",
  "latitude": 3.8936,
  "longitude": 11.5167,
  "zoneId": "uuid"
}
```

`PATCH /api/v1/menages/:id`

`DELETE /api/v1/menages/:id`

### Individus

`GET /api/v1/individus`

`POST /api/v1/individus`

```json
{
  "menageId": "uuid",
  "nom": "Mvondo",
  "prenom": "Aline",
  "sexe": "FEMININ",
  "age": 25,
  "profession": "Commercante",
  "niveauEtude": "SECONDAIRE"
}
```

Routes imbriquees :

- `GET /api/v1/menages/:menageId/individus`
- `POST /api/v1/menages/:menageId/individus`

Routes directes :

- `GET /api/v1/individus/:id`
- `PATCH /api/v1/individus/:id`
- `DELETE /api/v1/individus/:id`

### Synchronisation Offline

`POST /api/v1/sync`

```json
{
  "agentLocation": { "latitude": 3.8936, "longitude": 11.5167 },
  "menages": [
    {
      "localId": "local-1",
      "zone": "Zone A - Centre",
      "chefMenage": "Paul Mvondo",
      "nbPersonnes": 2
    }
  ],
  "individus": [
    {
      "localId": "ind-local-1",
      "localMenageId": "local-1",
      "nom": "Mvondo",
      "prenom": "Aline",
      "sexe": "FEMININ",
      "age": 25
    }
  ]
}
```

Reponse :

```json
{
  "success": true,
  "data": {
    "created": 2,
    "updated": 0,
    "errors": [],
    "menages": [{ "localId": "local-1", "serverId": "uuid" }],
    "individus": [{ "localId": "ind-local-1", "serverId": "uuid", "menageId": "uuid" }]
  }
}
```

### Statistiques

Reserve admin/superviseur :

- `GET /api/v1/stats`
- `GET /api/v1/stats/dashboard`
- `GET /api/v1/stats/agents`
- `GET /api/v1/stats/zones/:zoneId`

### Campagnes

Reserve admin/superviseur selon l'action :

- `GET /api/v1/campagnes`
- `GET /api/v1/campagnes/:id`
- `POST /api/v1/campagnes`
- `PUT /api/v1/campagnes/:id`
- `DELETE /api/v1/campagnes/:id`

### Agents

- `GET /api/v1/agents` : liste des agents avec progression, reserve admin/superviseur.
- `GET /api/v1/agents/me/dashboard` : dashboard de l'agent connecte.
- `GET /api/v1/agents/me/mission` : mission GPS de l'agent connecte.

### Export

Reserve admin :

- `GET /api/v1/export?type=menages&format=json`
- `GET /api/v1/export?type=menages&format=csv`
- `GET /api/v1/export/menages?format=xlsx`
- `GET /api/v1/export/menages?format=csv`
- `GET /api/v1/export/individus?format=xlsx`
- `GET /api/v1/export/rapport`

## Tests

```bash
npm test
npm run test:coverage
```

Les tests couvrent :

- services auth avec cas normaux et erreurs ;
- endpoints auth, zones, menages, individus, sync, agents ;
- scenarios token manquant, role interdit, validation 422 ;
- payload exact envoye par le frontend mobile.

## Frontend Mobile Connecte

Fichier principal :

```text
C:\Users\ABC\Desktop\LIDA\Census\services\api.ts
```

Ecrans branches :

- login : `components/signup.tsx`
- auto-inscription agent : `components/signupHabitant.tsx`
- dashboard agent : `app/rescenseur/dashboard.tsx`
- synchronisation : `app/rescenseur/Sync.tsx`
- suivi GPS : `app/rescenseur/ZoneTracking.tsx`
- soumission recensement : `app/rescenseur/recensement.tsx`
