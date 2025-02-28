import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance
// Using default configuration to work with standalone MongoDB
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export default prisma;