import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit roda fora do Next.js, então carregamos o .env.local manualmente
// (o Next.js já faz isso sozinho em runtime). `.env` é o fallback.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
