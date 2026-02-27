import { PrismaClient } from "@prisma/client";
// @ts-ignore
import { PrismaNeon } from "@prisma/adapter-neon";
// @ts-ignore
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing!");

  const pool = new Pool({ connectionString });
  
  // Ép kiểu để vượt qua lỗi "Cannot find module" của TS
  const adapter = new (PrismaNeon as any)(pool);

  return new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });
};

export const prisma = global.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
export default prisma;