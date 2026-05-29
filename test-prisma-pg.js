const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function test() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    
    await prisma.$connect();
    console.log('✅ Prisma connecté !');
    
    // Tester une requête simple
    const result = await prisma.$queryRaw`SELECT NOW() as now`;
    console.log('✅ Requête OK:', result[0].now);
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Erreur détaillée:', err);
  }
}

test();