import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Variáveis de ambiente tipadas (TypeScript).
 *
 * O schema é validado com Zod no boot da aplicação — server e client
 * compartilham os mesmos tipos inferidos automaticamente.
 */
export const env = createEnv({
  server: {
    // Banco de dados (Neon, Railway, local, etc.)
    DATABASE_URL: z.string().min(1),
    // Better Auth (autenticação própria)
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url().optional(),
    // IA — Ollama Cloud (API compatível com OpenAI)
    OLLAMA_API_KEY: z.string().min(1).optional(),
    OLLAMA_MODEL: z.string().min(1).default("gemma4:31b-cloud"),
    OLLAMA_BASE_URL: z
      .string()
      .url()
      .default("https://ollama.com/v1"),
    // Google OAuth (login + integrações)
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GOOGLE_REDIRECT_URI: z.string().url().optional(),
    GOOGLE_ANALYTICS_REDIRECT_URI: z.string().url().optional(),
    // Meta Ads
    META_APP_ID: z.string().min(1).optional(),
    META_APP_SECRET: z.string().min(1).optional(),
    META_REDIRECT_URI: z.string().url().optional(),
  },
  client: {
    // URL pública da aplicação (acessível no servidor e no browser)
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    GOOGLE_ANALYTICS_REDIRECT_URI: process.env.GOOGLE_ANALYTICS_REDIRECT_URI,
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    META_REDIRECT_URI: process.env.META_REDIRECT_URI,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
