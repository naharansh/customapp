import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function ensureSsl(url: string): string {
  const parsed = new URL(url);
  if (
    parsed.hostname !== "localhost" &&
    parsed.hostname !== "127.0.0.1" &&
    !parsed.searchParams.has("sslmode")
  ) {
    parsed.searchParams.set("sslmode", "require");
  }
  return parsed.toString();
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Configure it in your environment variables."
      );
    }
    process.env.DATABASE_URL = ensureSsl(url);
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
