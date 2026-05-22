import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env first, then .env.local overrides (mirrors Next.js behaviour)
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the direct (non-pooled) Neon connection for migrations
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
