try {
  console.log('1. Chargement dotenv');
  require('dotenv').config();
  
  console.log('2. Chargement express');
  const express = require('express');
  
  console.log('3. Chargement helmet');
  const helmet = require('helmet');
  
  console.log('4. Chargement cors');
  const cors = require('cors');
  
  console.log('5. Chargement morgan');
  const morgan = require('morgan');
  
  console.log('6. Chargement compression');
  const compression = require('compression');
  
  console.log('7. Chargement rateLimiter');
  const { generalLimiter } = require('./src/middleware/rateLimiter.middleware');
  
  console.log('8. Chargement error middleware');
  const { errorHandler, notFound } = require('./src/middleware/error.middleware');
  
  console.log('9. Chargement logger');
  const logger = require('./src/config/logger');
  
  console.log('10. Chargement auth routes');
  const authRoutes = require('./src/modules/auth/auth.routes');
  
  console.log('11. Chargement zone routes');
  const zoneRoutes = require('./src/modules/zones/zone.routes');
  
  console.log('12. Chargement menage routes');
  const menageRoutes = require('./src/modules/menages/menage.routes');
  
  console.log('13. Chargement individu routes');
  const individuRoutes = require('./src/modules/individus/individu.routes');
  
  console.log('14. Chargement sync routes');
  const syncRoutes = require('./src/modules/synchro/sync.routes');
  
  console.log('15. Chargement stats routes');
  const statsRoutes = require('./src/modules/stats/stats.routes');
  
  console.log('16. Chargement export routes');
  const exportRoutes = require('./src/modules/export/export.routes');
  
  console.log('✅ TOUS LES MODULES SONT CHARGÉS AVEC SUCCÈS !');
  
} catch (err) {
  console.error('❌ ERREUR:', err.message);
  console.error('Stack:', err.stack);
}