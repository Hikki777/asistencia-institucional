const { PrismaClient } = require('@prisma/client');

const { DB_PATH } = require('./utils/paths');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${DB_PATH}`,
    },
  },
  errorFormat: 'pretty',
  log: ['error', 'warn']
});

module.exports = prisma;
