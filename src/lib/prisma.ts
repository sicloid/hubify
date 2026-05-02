import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

/** Load `.env.local` last with `override: true` so repo DB URL wins over a stray shell `DATABASE_URL=...@localhost`. */
function ensureDatabaseEnvLoaded(): void {
  const root = process.cwd();
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { config } = require("dotenv") as typeof import("dotenv");
    const envFile = resolve(root, ".env");
    const envLocalFile = resolve(root, ".env.local");
    if (existsSync(envFile)) config({ path: envFile });
    if (existsSync(envLocalFile)) config({ path: envLocalFile, override: true });
  } catch {
    /* dotenv is a transitive dependency; if absent, rely on runtime env only */
  }
}

ensureDatabaseEnvLoaded();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
