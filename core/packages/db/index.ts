import { PrismaClient } from './generated/prisma';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    },
  },
});