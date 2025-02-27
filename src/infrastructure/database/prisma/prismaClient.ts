import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance to be used across the app
const prisma = new PrismaClient();

export default prisma;