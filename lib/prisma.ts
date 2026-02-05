import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";

// Bật WebSocket cho Neon serverless
neonConfig.webSocketConstructor = ws;

// Tạo adapter đúng kiểu
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!, // chú ý: phải là property
});

// Singleton Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
