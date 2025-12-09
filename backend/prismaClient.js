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
  log: ['error', 'warn']
});

module.exports = prisma;
