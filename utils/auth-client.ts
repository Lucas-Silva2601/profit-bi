import { createAuthClient } from "better-auth/react";

/**
 * Cliente Better Auth para componentes React ("use client").
 * Por padrão aponta para a origem atual (mesmo domínio do app).
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
