import { headers } from "next/headers";
import { auth } from "@/utils/auth";

/** Retorna o usuário da sessão atual (ou null se não autenticado). */
export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/** Retorna o usuário atual ou lança "Não autorizado". */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Não autorizado");
  return user;
}
