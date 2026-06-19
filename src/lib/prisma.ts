import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL!;

const url = new URL(connectionString);
url.searchParams.set("connectionLimit", "5");
url.searchParams.set("acquireTimeout", "30000");
url.searchParams.set("connectTimeout", "15000");

const adapter = new PrismaMariaDb(url.toString());

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

globalForPrisma.prisma = prisma;
