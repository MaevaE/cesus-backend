// ============================================
// CESUS - config/swagger.js
// Configuration OpenAPI/Swagger de l'API CESUS.
// ============================================
const swaggerJsdoc = require('swagger-jsdoc');

const bearerAuth = [{ bearerAuth: [] }];

/**
 * @description Construit la specification Swagger en francais.
 * @returns {Object} Specification OpenAPI prete pour swagger-ui-express.
 */
function buildSwaggerSpec() {
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'CESUS API',
        version: '1.0.0',
        description: 'Documentation de l API du systeme numerique de recensement CESUS.',
      },
      servers: [
        { url: '/api/v1', description: 'API versionnee par defaut' },
        { url: '/api', description: 'Alias compatible mobile/MVP' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          ApiSuccess: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              message: { type: 'string', example: 'Operation reussie' },
              data: { type: 'object' },
            },
          },
          ApiError: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              message: { type: 'string', example: 'Erreur de validation' },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'VALIDATION_ERROR' },
                  details: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              nom: { type: 'string' },
              prenom: { type: 'string' },
              email: { type: 'string', format: 'email' },
              telephone: { type: 'string' },
              role: { type: 'object', properties: { nom: { type: 'string', example: 'AGENT' } } },
            },
          },
          Menage: {
            type: 'object',
            required: ['nomChef', 'prenomChef'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              codeUnique: { type: 'string' },
              nomChef: { type: 'string' },
              prenomChef: { type: 'string' },
              adresse: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              zoneId: { type: 'string', format: 'uuid' },
              agentId: { type: 'string', format: 'uuid' },
              nombreMembres: { type: 'integer' },
            },
          },
          Individu: {
            type: 'object',
            required: ['nom', 'prenom', 'sexe', 'menageId'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              nom: { type: 'string' },
              prenom: { type: 'string' },
              sexe: { type: 'string', enum: ['MASCULIN', 'FEMININ'] },
              age: { type: 'integer' },
              dateNaissance: { type: 'string', format: 'date' },
              profession: { type: 'string' },
              niveauEtude: { type: 'string' },
              lienChef: { type: 'string' },
              menageId: { type: 'string', format: 'uuid' },
            },
          },
          Zone: {
            type: 'object',
            required: ['nom'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              nom: { type: 'string' },
              description: { type: 'string' },
              region: { type: 'string' },
              departement: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
            },
          },
          Campagne: {
            type: 'object',
            required: ['nom', 'dateDebut'],
            properties: {
              id: { type: 'string', format: 'uuid' },
              nom: { type: 'string' },
              description: { type: 'string' },
              dateDebut: { type: 'string', format: 'date-time' },
              dateFin: { type: 'string', format: 'date-time' },
              statut: { type: 'string', enum: ['EN_COURS', 'TERMINEE', 'SUSPENDUE'] },
              zoneIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            },
          },
          SyncPayload: {
            type: 'object',
            properties: {
              menages: { type: 'array', items: { $ref: '#/components/schemas/Menage' } },
              individus: { type: 'array', items: { $ref: '#/components/schemas/Individu' } },
              agentLocation: {
                type: 'object',
                properties: {
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                },
              },
            },
          },
        },
      },
      paths: buildPaths(),
    },
    apis: [],
  });
}

/**
 * @description Decrit les endpoints REST principaux de l'API.
 * @returns {Object} Chemins OpenAPI.
 */
function buildPaths() {
  const jsonResponse = {
    200: { description: 'Reponse reussie', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } },
    400: { description: 'Requete invalide', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
    401: { description: 'Authentification requise', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
    403: { description: 'Acces refuse', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
    404: { description: 'Ressource introuvable', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
    500: { description: 'Erreur serveur', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
  };

  const listParams = [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page a recuperer' },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 }, description: 'Nombre de lignes par page' },
    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche texte' },
  ];

  const idParam = [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Identifiant de la ressource' }];

  const crud = (tag, schemaName) => ({
    get: { tags: [tag], security: bearerAuth, summary: `Lister les ${tag.toLowerCase()}`, parameters: listParams, responses: jsonResponse },
    post: {
      tags: [tag],
      security: bearerAuth,
      summary: `Creer un element ${tag.toLowerCase()}`,
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}` } } } },
      responses: { 201: jsonResponse[200], ...jsonResponse },
    },
  });

  const crudById = (tag, schemaName) => ({
    get: { tags: [tag], security: bearerAuth, summary: `Lire le detail ${tag.toLowerCase()}`, parameters: idParam, responses: jsonResponse },
    put: {
      tags: [tag],
      security: bearerAuth,
      summary: `Modifier completement ${tag.toLowerCase()}`,
      parameters: idParam,
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}` } } } },
      responses: jsonResponse,
    },
    patch: {
      tags: [tag],
      security: bearerAuth,
      summary: `Modifier partiellement ${tag.toLowerCase()}`,
      parameters: idParam,
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}` } } } },
      responses: jsonResponse,
    },
    delete: { tags: [tag], security: bearerAuth, summary: `Supprimer ${tag.toLowerCase()}`, parameters: idParam, responses: jsonResponse },
  });

  return {
    '/auth/register': {
      post: {
        tags: ['Authentification'],
        security: bearerAuth,
        summary: 'Inscrire un utilisateur',
        description: 'Cree un utilisateur depuis le tableau de bord administrateur.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        responses: { 201: jsonResponse[200], ...jsonResponse },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentification'],
        summary: 'Connecter un utilisateur',
        description: 'Retourne un access token JWT, un refresh token et le profil utilisateur.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email', 'motDePasse'], properties: { email: { type: 'string' }, motDePasse: { type: 'string' } } } } },
        },
        responses: jsonResponse,
      },
    },
    '/auth/me': { get: { tags: ['Authentification'], security: bearerAuth, summary: 'Profil connecte', responses: jsonResponse } },
    '/menages': crud('Menages', 'Menage'),
    '/menages/{id}': crudById('Menages', 'Menage'),
    '/individus': crud('Individus', 'Individu'),
    '/individus/{id}': crudById('Individus', 'Individu'),
    '/zones': crud('Zones', 'Zone'),
    '/zones/{id}': crudById('Zones', 'Zone'),
    '/campagnes': crud('Campagnes', 'Campagne'),
    '/campagnes/{id}': crudById('Campagnes', 'Campagne'),
    '/stats': { get: { tags: ['Statistiques'], security: bearerAuth, summary: 'Statistiques globales', responses: jsonResponse } },
    '/export': {
      get: {
        tags: ['Export'],
        security: bearerAuth,
        summary: 'Exporter les donnees en JSON ou CSV',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['menages', 'individus', 'zones'] } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['json', 'csv'] } },
        ],
        responses: jsonResponse,
      },
    },
    '/agents': { get: { tags: ['Agents'], security: bearerAuth, summary: 'Liste des agents avec progression', responses: jsonResponse } },
    '/agents/me/dashboard': { get: { tags: ['Agents'], security: bearerAuth, summary: 'Dashboard de l agent connecte', responses: jsonResponse } },
    '/sync': {
      post: {
        tags: ['Synchronisation'],
        security: bearerAuth,
        summary: 'Synchroniser les donnees offline',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SyncPayload' } } } },
        responses: jsonResponse,
      },
    },
  };
}

module.exports = { buildSwaggerSpec };
