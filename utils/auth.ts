import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";

/**
 * Autenticação própria via Better Auth.
 * - E-mail/senha habilitados
 * - Google OAuth habilitado quando as credenciais estão configuradas
 * - Sessões em banco (tabela `session`), cookies via plugin nextCookies
 * - No primeiro login, cria automaticamente `profiles` + `workspaces`
 */
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),
  databaseHooks: {
    user: {
      create: {
        // Replica o antigo trigger do Supabase: perfil + workspace padrão
        after: async (newUser) => {
          await db.insert(schema.profiles).values({
            id: newUser.id,
            fullName: newUser.name || "Usuário",
            email: newUser.email,
          });
          await db.insert(schema.workspaces).values({
            ownerId: newUser.id,
            name: `${newUser.name || "Meu"} Workspace`,
          });
        },
      },
    },
  },
  // Plugin obrigatório para cookies em Server Components/Actions — deve ser o último
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
