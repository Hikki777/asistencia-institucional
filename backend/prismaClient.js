const { PrismaClient } = require('@prisma/client');

// Sanitizar URL si viene con prefijo accidental
let url = process.env.DATABASE_URL;
if (url && url.startsWith('DATABASE_URL=')) {
  url = url.replace('DATABASE_URL=', '');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
  errorFormat: 'pretty',
  log: ['error', 'warn'],
  // Deshabilitar prepared statements para compatibilidad con Supabase pgBouncer
  __internal: {
    engine: {
      connection_limit: 1
    }
  }
});

module.exports = prisma;
