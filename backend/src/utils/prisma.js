const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance across the app (and across
// hot-reloads in dev) to avoid exhausting database connections.
const prisma = global.__civicfix_prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__civicfix_prisma = prisma;

module.exports = prisma;
