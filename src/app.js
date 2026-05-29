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

const { generalLimiter } = require('./middleware/ratelimiter.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('../src/modules/auth/auth.routes');
const zoneRoutes = require('../src/modules/zones/zone.routes');
const menageRoutes = require('../src/modules/menages/menage.routes');
const individuRoutes = require('../src/modules/individus/individu.routes');
const syncRoutes = require('../src/modules/synchro/sync.routes');
const statsRoutes = require('../src/modules/stats/stats.routes');
const exportRoutes = require('../src/modules/export/export.routes');
const agentRoutes = require('../src/modules/agents/agent.routes');

const app = express();
const API = process.env.API_PREFIX || '/api/v1';

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
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/zones`, zoneRoutes);
app.use(`${API}/menages`, menageRoutes);
app.use(`${API}/individus`, individuRoutes);
app.use(`${API}/sync`, syncRoutes);
app.use(`${API}/stats`, statsRoutes);
app.use(`${API}/export`, exportRoutes);
app.use(`${API}/agents`, agentRoutes);

// ─── Gestion des erreurs ──────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
