// // ============================================
// // CESUS – Seed : données initiales
// // ============================================
// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Démarrage du seed...');

//   // 1. Créer les rôles
//   const roles = await Promise.all([
//     prisma.role.upsert({
//       where: { nom: 'ADMIN' },
//       update: {},
//       create: { nom: 'ADMIN', description: 'Administrateur du système' },
//     }),
//     prisma.role.upsert({
//       where: { nom: 'AGENT' },
//       update: {},
//       create: { nom: 'AGENT', description: 'Agent recenseur terrain' },
//     }),
//     prisma.role.upsert({
//       where: { nom: 'SUPERVISEUR' },
//       update: {},
//       create: { nom: 'SUPERVISEUR', description: 'Superviseur intermédiaire' },
//     }),
//   ]);

//   console.log('✅ Rôles créés:', roles.map((r) => r.nom).join(', '));

//   const adminRole = roles.find((r) => r.nom === 'ADMIN');
//   const agentRole = roles.find((r) => r.nom === 'AGENT');

//   // 2. Créer l'admin par défaut
//   const hashedPassword = await bcrypt.hash('Admin@cesus2024', 12);

//   const admin = await prisma.user.upsert({
//     where: { email: 'admin@cesus.cm' },
//     update: {},
//     create: {
//       nom: 'Super',
//       prenom: 'Admin',
//       email: 'admin@cesus.cm',
//       motDePasse: hashedPassword,
//       telephone: '+237600000000',
//       roleId: adminRole.id,
//     },
//   });

//   console.log('✅ Admin créé:', admin.email);

//   // 3. Créer des zones de démonstration
//   const zones = await Promise.all([
//     prisma.zone.upsert({
//       where: { id: 'zone-yaounde-1' },
//       update: {},
//       create: {
//         id: 'zone-yaounde-1',
//         nom: 'Yaoundé Centre',
//         region: 'Centre',
//         departement: 'Mfoundi',
//         latitude: 3.848,
//         longitude: 11.502,
//       },
//     }),
//     prisma.zone.upsert({
//       where: { id: 'zone-douala-1' },
//       update: {},
//       create: {
//         id: 'zone-douala-1',
//         nom: 'Douala Akwa',
//         region: 'Littoral',
//         departement: 'Wouri',
//         latitude: 4.0511,
//         longitude: 9.7085,
//       },
//     }),
//   ]);

//   console.log('✅ Zones créées:', zones.map((z) => z.nom).join(', '));

//   // 4. Créer un agent de démonstration
//   const agentPassword = await bcrypt.hash('Agent@cesus2024', 12);

//   const agentUser = await prisma.user.upsert({
//     where: { email: 'agent1@cesus.cm' },
//     update: {},
//     create: {
//       nom: 'Mbarga',
//       prenom: 'Jean',
//       email: 'agent1@cesus.cm',
//       motDePasse: agentPassword,
//       telephone: '+237611000001',
//       roleId: agentRole.id,
//       agent: {
//         create: {
//           zoneId: zones[0].id,
//         },
//       },
//     },
//   });

//   console.log('✅ Agent créé:', agentUser.email);

//   // 5. Créer une campagne de démonstration
//   const campagne = await prisma.campagne.upsert({
//     where: { id: 'camp-2024-1' },
//     update: {},
//     create: {
//       id: 'camp-2024-1',
//       nom: 'Recensement National 2024',
//       description: 'Première campagne de recensement numérique',
//       dateDebut: new Date('2024-01-01'),
//       statut: 'EN_COURS',
//       zones: {
//         create: zones.map((z) => ({ zoneId: z.id })),
//       },
//     },
//   });

//   console.log('✅ Campagne créée:', campagne.nom);
//   console.log('\n🎉 Seed terminé avec succès !');
//   console.log('─────────────────────────────────────');
//   console.log('📧 Admin    : admin@cesus.cm');
//   console.log('🔑 Password : Admin@cesus2024');
//   console.log('📧 Agent    : agent1@cesus.cm');
//   console.log('🔑 Password : Agent@cesus2024');
//   console.log('─────────────────────────────────────');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Erreur seed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


// // ============================================
// // CESUS – Seed : données initiales
// // ============================================
// const { PrismaClient } = require('@prisma/client');
// const { PrismaPg } = require('@prisma/adapter-pg');
// const { Pool } = require('pg');
// const bcrypt = require('bcryptjs');

// // Configuration de l'adapter PostgreSQL (comme dans database.js)
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: false,  // Désactiver SSL si pas configuré
//   max: 1,
// });

// // Attendre que le pool soit prêt
// pool.on('connect', () => console.log('✅ Pool PostgreSQL connecté'));

// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log('🌱 Démarrage du seed...');

//   // 1. Créer les rôles
//   const roles = await Promise.all([
//     prisma.role.upsert({
//       where: { nom: 'ADMIN' },
//       update: {},
//       create: { nom: 'ADMIN', description: 'Administrateur du système' },
//     }),
//     prisma.role.upsert({
//       where: { nom: 'AGENT' },
//       update: {},
//       create: { nom: 'AGENT', description: 'Agent recenseur terrain' },
//     }),
//     prisma.role.upsert({
//       where: { nom: 'SUPERVISEUR' },
//       update: {},
//       create: { nom: 'SUPERVISEUR', description: 'Superviseur intermédiaire' },
//     }),
//   ]);

//   console.log('✅ Rôles créés:', roles.map((r) => r.nom).join(', '));

//   const adminRole = roles.find((r) => r.nom === 'ADMIN');
//   const agentRole = roles.find((r) => r.nom === 'AGENT');

//   // 2. Créer l'admin par défaut
//   const hashedPassword = await bcrypt.hash('Admin@cesus2024', 12);

//   const admin = await prisma.user.upsert({
//     where: { email: 'admin@cesus.cm' },
//     update: {},
//     create: {
//       nom: 'Super',
//       prenom: 'Admin',
//       email: 'admin@cesus.cm',
//       motDePasse: hashedPassword,
//       telephone: '+237600000000',
//       roleId: adminRole.id,
//     },
//   });

//   console.log('✅ Admin créé:', admin.email);

//   // 3. Créer des zones de démonstration
//   const zones = await Promise.all([
//     prisma.zone.upsert({
//       where: { id: 'zone-yaounde-1' },
//       update: {},
//       create: {
//         id: 'zone-yaounde-1',
//         nom: 'Yaoundé Centre',
//         region: 'Centre',
//         departement: 'Mfoundi',
//         latitude: 3.848,
//         longitude: 11.502,
//       },
//     }),
//     prisma.zone.upsert({
//       where: { id: 'zone-douala-1' },
//       update: {},
//       create: {
//         id: 'zone-douala-1',
//         nom: 'Douala Akwa',
//         region: 'Littoral',
//         departement: 'Wouri',
//         latitude: 4.0511,
//         longitude: 9.7085,
//       },
//     }),
//   ]);

//   console.log('✅ Zones créées:', zones.map((z) => z.nom).join(', '));

//   // 4. Créer un agent de démonstration
//   const agentPassword = await bcrypt.hash('Agent@cesus2024', 12);

//   const agentUser = await prisma.user.upsert({
//     where: { email: 'agent1@cesus.cm' },
//     update: {},
//     create: {
//       nom: 'Mbarga',
//       prenom: 'Jean',
//       email: 'agent1@cesus.cm',
//       motDePasse: agentPassword,
//       telephone: '+237611000001',
//       roleId: agentRole.id,
//       agent: {
//         create: {
//           zoneId: zones[0].id,
//         },
//       },
//     },
//   });

//   console.log('✅ Agent créé:', agentUser.email);

//   // 5. Créer une campagne de démonstration
//   const campagne = await prisma.campagne.upsert({
//     where: { id: 'camp-2024-1' },
//     update: {},
//     create: {
//       id: 'camp-2024-1',
//       nom: 'Recensement National 2024',
//       description: 'Première campagne de recensement numérique',
//       dateDebut: new Date('2024-01-01'),
//       statut: 'EN_COURS',
//       zones: {
//         create: zones.map((z) => ({ zoneId: z.id })),
//       },
//     },
//   });

//   console.log('✅ Campagne créée:', campagne.nom);
//   console.log('\n🎉 Seed terminé avec succès !');
//   console.log('─────────────────────────────────────');
//   console.log('📧 Admin    : admin@cesus.cm');
//   console.log('🔑 Password : Admin@cesus2024');
//   console.log('📧 Agent    : agent1@cesus.cm');
//   console.log('🔑 Password : Agent@cesus2024');
//   console.log('─────────────────────────────────────');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Erreur seed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// ============================================
// CESUS – Seed : données initiales
// ============================================
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');  // ← Gardez bcryptjs ou changez pour bcrypt
require('dotenv').config();

// Configuration du pool (identique au test qui fonctionne)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du seed...');

  // 1. Créer les rôles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { nom: 'ADMIN' },
      update: {},
      create: { nom: 'ADMIN', description: 'Administrateur du système' },
    }),
    prisma.role.upsert({
      where: { nom: 'AGENT' },
      update: {},
      create: { nom: 'AGENT', description: 'Agent recenseur terrain' },
    }),
    prisma.role.upsert({
      where: { nom: 'SUPERVISEUR' },
      update: {},
      create: { nom: 'SUPERVISEUR', description: 'Superviseur intermédiaire' },
    }),
  ]);

  console.log('✅ Rôles créés:', roles.map((r) => r.nom).join(', '));

  const adminRole = roles.find((r) => r.nom === 'ADMIN');
  const agentRole = roles.find((r) => r.nom === 'AGENT');

  // 2. Créer l'admin par défaut
  const hashedPassword = await bcrypt.hash('Admin@cesus2024', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cesus.cm' },
    update: {},
    create: {
      nom: 'Super',
      prenom: 'Admin',
      email: 'admin@cesus.cm',
      motDePasse: hashedPassword,
      telephone: '+237600000000',
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin créé:', admin.email);

  // 3. Créer des zones de démonstration
  const zones = await Promise.all([
    prisma.zone.upsert({
      where: { id: 'zone-yaounde-1' },
      update: {},
      create: {
        id: 'zone-yaounde-1',
        nom: 'Yaoundé Centre',
        region: 'Centre',
        departement: 'Mfoundi',
        latitude: 3.848,
        longitude: 11.502,
      },
    }),
    prisma.zone.upsert({
      where: { id: 'zone-douala-1' },
      update: {},
      create: {
        id: 'zone-douala-1',
        nom: 'Douala Akwa',
        region: 'Littoral',
        departement: 'Wouri',
        latitude: 4.0511,
        longitude: 9.7085,
      },
    }),
  ]);

  console.log('✅ Zones créées:', zones.map((z) => z.nom).join(', '));

  // 4. Créer un agent de démonstration
  const agentPassword = await bcrypt.hash('Agent@cesus2024', 12);

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent1@cesus.cm' },
    update: {},
    create: {
      nom: 'Mbarga',
      prenom: 'Jean',
      email: 'agent1@cesus.cm',
      motDePasse: agentPassword,
      telephone: '+237611000001',
      roleId: agentRole.id,
      agent: {
        create: {
          zoneId: zones[0].id,
        },
      },
    },
  });

  console.log('✅ Agent créé:', agentUser.email);

  // 5. Créer une campagne de démonstration
  const campagne = await prisma.campagne.upsert({
    where: { id: 'camp-2024-1' },
    update: {},
    create: {
      id: 'camp-2024-1',
      nom: 'Recensement National 2024',
      description: 'Première campagne de recensement numérique',
      dateDebut: new Date('2024-01-01'),
      statut: 'EN_COURS',
      zones: {
        create: zones.map((z) => ({ zoneId: z.id })),
      },
    },
  });

  console.log('✅ Campagne créée:', campagne.nom);
  console.log('\n🎉 Seed terminé avec succès !');
  console.log('─────────────────────────────────────');
  console.log('📧 Admin    : admin@cesus.cm');
  console.log('🔑 Password : Admin@cesus2024');
  console.log('📧 Agent    : agent1@cesus.cm');
  console.log('🔑 Password : Agent@cesus2024');
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });