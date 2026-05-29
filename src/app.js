// import express from "express";
// import cors from "cors";

// import authRoutes from "./routes/authRoute.js";
// import householdRoutes from "./routes/householdRoute.js";
// import dashboardRoutes from "./routes/dashboardRoute.js";

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/households", householdRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// export default app;

// ============================================
// CESUS – src/app.js
// Configuration Express centrale
// ============================================
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');

const { generalLimiter } = require('./middleware/ratelimiter.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const logger = require('./config/logger');
const { buildSwaggerSpec } = require('./config/swagger');

// Import routes
const authRoutes = require('../src/modules/auth/auth.routes');
const zoneRoutes = require('../src/modules/zones/zone.routes');
const menageRoutes = require('../src/modules/menages/menage.routes');
const individuRoutes = require('../src/modules/individus/individu.routes');
const syncRoutes = require('../src/modules/synchro/sync.routes');
const statsRoutes = require('../src/modules/stats/stats.routes');
const exportRoutes = require('../src/modules/export/export.routes');
const agentRoutes = require('../src/modules/agents/agent.routes');
const campagneRoutes = require('../src/modules/campagnes/campagne.routes');

const app = express();
const API = process.env.API_PREFIX || '/api/v1';
const API_ALIASES = [...new Set([API, '/api'])];

// ─── Sécurité ─────────────────────────────
app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean);
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    if (isDevelopment || !origin || !allowedOrigins?.length || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Performance ──────────────────────────
app.use(compression());
app.use(generalLimiter);

// ─── Parsing ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logs HTTP ────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health',
  })
);

// ─── Health Check ─────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'CESUS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Routes API ───────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(buildSwaggerSpec(), { explorer: true }));

API_ALIASES.forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/zones`, zoneRoutes);
  app.use(`${prefix}/menages`, menageRoutes);
  app.use(`${prefix}/individus`, individuRoutes);
  app.use(`${prefix}/sync`, syncRoutes);
  app.use(`${prefix}/stats`, statsRoutes);
  app.use(`${prefix}/export`, exportRoutes);
  app.use(`${prefix}/agents`, agentRoutes);
  app.use(`${prefix}/campagnes`, campagneRoutes);
});

// ─── Gestion des erreurs ──────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
