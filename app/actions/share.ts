"use server";
import { db } from "@/db";
import { dashboards, workspaces } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { requireUser } from "@/utils/session";
import { env } from "@/env";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "profit-bi-share-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Verifica (no servidor) se o dashboard pertence aos workspaces do usuário. */
async function assertOwnsDashboard(userId: string, dashboardId: string) {
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
  if (!row) throw new Error("Painel não encontrado.");
}

export async function getOrCreateShareToken(dashboardId: string) {
  const user = await requireUser();
  if (!dashboardId) throw new Error("Dashboard não identificado.");

  await assertOwnsDashboard(user.id, dashboardId);

  const [existing] = await db
    .select({ publicShareToken: dashboards.publicShareToken })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);

  if (existing?.publicShareToken) return existing.publicShareToken;

  const newToken = crypto.randomUUID();
  const [updated] = await db
    .update(dashboards)
    .set({ publicShareToken: newToken })
    .where(eq(dashboards.id, dashboardId))
    .returning({ publicShareToken: dashboards.publicShareToken });

  if (!updated?.publicShareToken) throw new Error("Falha ao criar o link público.");
  return updated.publicShareToken;
}

export type ShareSettings = {
  password?: string;
  expiresAt?: string | null;
  viewCount?: number;
};

export async function updateShareSettings(
  dashboardId: string,
  settings: Omit<ShareSettings, "viewCount">
) {
  const user = await requireUser();
  await assertOwnsDashboard(user.id, dashboardId);

  const [data] = await db
    .select({ layoutConfig: dashboards.layoutConfig })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);

  if (!data) throw new Error("Painel não encontrado.");

  const layout = (data.layoutConfig ?? {}) as Record<string, any>;
  const currentShare = (layout.shareSettings ?? {}) as ShareSettings;

  let token: string | null = (
    await db
      .select({ publicShareToken: dashboards.publicShareToken })
      .from(dashboards)
      .where(eq(dashboards.id, dashboardId))
      .limit(1)
  )[0]?.publicShareToken ?? null;
  if (!token) token = crypto.randomUUID();

  const hashedPassword = settings.password
    ? await hashPassword(settings.password)
    : "";

  const updatedLayout = {
    ...layout,
    shareSettings: {
      ...currentShare,
      password: hashedPassword,
      expiresAt: settings.expiresAt ?? null,
    },
  };

  await db
    .update(dashboards)
    .set({ layoutConfig: updatedLayout, publicShareToken: token })
    .where(eq(dashboards.id, dashboardId));

  return `${env.NEXT_PUBLIC_BASE_URL ?? ""}/share/${token}`;
}

export async function verifySharePassword(
  dashboardId: string,
  password: string
): Promise<boolean> {
  // Acesso público (página de share) — consulta direta, sem escopo de usuário
  const [data] = await db
    .select({ layoutConfig: dashboards.layoutConfig })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);
  if (!data) return false;

  const layout = (data.layoutConfig ?? {}) as Record<string, any>;
  const settings = (layout.shareSettings ?? {}) as ShareSettings;

  if (!settings.password) return true;

  const hashedInput = await hashPassword(password);
  return hashedInput === settings.password;
}

export async function incrementViewCount(dashboardId: string) {
  const [data] = await db
    .select({ layoutConfig: dashboards.layoutConfig })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);
  if (!data) return;

  const layout = (data.layoutConfig ?? {}) as Record<string, any>;
  const settings = (layout.shareSettings ?? {}) as ShareSettings;
  const updated = {
    ...layout,
    shareSettings: { ...settings, viewCount: (settings.viewCount ?? 0) + 1 },
  };

  await db
    .update(dashboards)
    .set({ layoutConfig: updated })
    .where(eq(dashboards.id, dashboardId));
}

export async function getShareSettings(
  dashboardId: string
): Promise<ShareSettings & { token?: string }> {
  const user = await requireUser();
  await assertOwnsDashboard(user.id, dashboardId);

  const [data] = await db
    .select({
      layoutConfig: dashboards.layoutConfig,
      publicShareToken: dashboards.publicShareToken,
    })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);

  if (!data) return {};
  const layout = (data.layoutConfig ?? {}) as Record<string, any>;
  return {
    ...(layout.shareSettings ?? {}),
    token: data.publicShareToken ?? undefined,
  };
}
