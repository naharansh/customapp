import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure it in your environment variables."
    );
  }
  const parsed = new URL(url);
  if (
    parsed.hostname !== "localhost" &&
    parsed.hostname !== "127.0.0.1" &&
    !parsed.searchParams.has("ssl")
  ) {
    parsed.searchParams.set("ssl", "true");
  }
  return parsed.toString();
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = getDatasourceUrl();
    const adapter = new PrismaMariaDb(url);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
