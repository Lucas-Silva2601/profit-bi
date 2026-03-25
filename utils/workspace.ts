import { db } from "@/db";
import { dashboards, datasets, workspaces } from "@/db/schema";
import { and, asc, eq, isNull, inArray } from "drizzle-orm";

/**
 * IDs dos workspaces ativos do usuário (soft-delete excluído).
 * É a base do isolamento multi-tenant que antes era feito pelo RLS.
 */
export async function getUserWorkspaceIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(and(eq(workspaces.ownerId, userId), isNull(workspaces.deletedAt)));
  return rows.map((r) => r.id);
}

/** Garante que o usuário tenha um workspace e retorna o ID do primeiro. */
export async function getOrCreateWorkspace(userId: string): Promise<string> {
  const [existing] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(and(eq(workspaces.ownerId, userId), isNull(workspaces.deletedAt)))
    .orderBy(asc(workspaces.createdAt))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(workspaces)
    .values({ ownerId: userId, name: "Meu Workspace" })
    .returning({ id: workspaces.id });

  if (!created) throw new Error("Erro crítico no Banco. Falha ao criar workspace.");
  return created.id;
}

/** Retorna o primeiro workspace do usuário (ou null). */
export async function getFirstWorkspaceId(userId: string): Promise<string | null> {
  const ids = await getUserWorkspaceIds(userId);
  return ids[0] ?? null;
}

/** Verifica se um dashboard pertence aos workspaces do usuário (anti-RLS). */
export async function userOwnsDashboard(
  userId: string,
  dashboardId: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: dashboards.id })
    .from(dashboards)
    .innerJoin(workspaces, eq(dashboards.workspaceId, workspaces.id))
    .where(
      and(
        eq(dashboards.id, dashboardId),
        eq(workspaces.ownerId, userId),
        isNull(dashboards.deletedAt)
      )
    )
    .limit(1);
  return !!row;
}

/** Verifica se um dataset pertence aos workspaces do usuário (anti-RLS). */
export async function userOwnsDataset(
  userId: string,
  datasetId: string
): Promise<boolean> {
  const ids = await getUserWorkspaceIds(userId);
  if (ids.length === 0) return false;
  const [row] = await db
    .select({ id: datasets.id })
    .from(datasets)
    .where(and(eq(datasets.id, datasetId), inArray(datasets.workspaceId, ids)))
    .limit(1);
  return !!row;
}

/** Filtra UUIDs válidos para uso em inArray (evita erro de casting). */
export function validUuids(ids: unknown[]): string[] {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (ids.filter((id) => typeof id === "string" && uuidRe.test(id)) as string[]);
}

export { inArray };
