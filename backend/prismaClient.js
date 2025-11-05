const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: ['error', 'warn']
});

module.exports = prisma;
