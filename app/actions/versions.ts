"use server";
import { db } from "@/db";
import { dashboards } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/utils/session";
import { userOwnsDashboard } from "@/utils/workspace";

export type DashboardVersion = {
  timestamp: string;
  label: string;
  kpisCount: number;
  chartsCount: number;
  layoutSnapshot: any; // o layout_config completo (sem versions, shareSettings)
};

/** Salva a versão atual do layout antes de regenerar. Mantém as últimas 5. */
export async function saveLayoutVersion(dashboardId: string): Promise<void> {
  const user = await requireUser();
  if (!(await userOwnsDashboard(user.id, dashboardId))) {
    throw new Error("Painel não encontrado.");
  }

  const [data] = await db
    .select({ layoutConfig: dashboards.layoutConfig })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);

  if (!data?.layoutConfig) return;

  const layout = data.layoutConfig as any;
  const { versions = [], shareSettings, ...configToSave } = layout;

  const newVersion: DashboardVersion = {
    timestamp: new Date().toISOString(),
    label: `Versão ${(versions as any[]).length + 1}`,
    kpisCount: (configToSave.kpis ?? []).length,
    chartsCount: (configToSave.charts ?? []).length,
    layoutSnapshot: configToSave,
  };

  const updatedVersions: DashboardVersion[] = [newVersion, ...(versions as DashboardVersion[])].slice(0, 5);

  await db
    .update(dashboards)
    .set({ layoutConfig: { ...layout, versions: updatedVersions } })
    .where(eq(dashboards.id, dashboardId));
}

/** Restaura uma versão pelo índice (0 = mais recente) */
export async function restoreLayoutVersion(dashboardId: string, index: number): Promise<void> {
  const user = await requireUser();
  if (!(await userOwnsDashboard(user.id, dashboardId))) {
    throw new Error("Painel não encontrado.");
  }

  const [data] = await db
    .select({ layoutConfig: dashboards.layoutConfig })
    .from(dashboards)
    .where(eq(dashboards.id, dashboardId))
    .limit(1);

  if (!data?.layoutConfig) throw new Error("Dashboard não encontrado.");

  const layout   = data.layoutConfig as any;
  const versions = (layout.versions ?? []) as DashboardVersion[];
  const target   = versions[index];

  if (!target) throw new Error("Versão não encontrada.");

  // Salva a versão atual antes de restaurar (para não perder o estado mais recente)
  const { versions: _v, shareSettings, ...currentConfig } = layout;
  const currentAsVersion: DashboardVersion = {
    timestamp: new Date().toISOString(),
    label: `Antes da restauração`,
    kpisCount: (currentConfig.kpis ?? []).length,
    chartsCount: (currentConfig.charts ?? []).length,
    layoutSnapshot: currentConfig,
  };

  const updatedVersions = [currentAsVersion, ...versions].slice(0, 5);
  const restoredLayout  = {
    ...target.layoutSnapshot,
    shareSettings: layout.shareSettings ?? {},
    versions: updatedVersions,
  };

  await db
    .update(dashboards)
    .set({ layoutConfig: restoredLayout })
    .where(eq(dashboards.id, dashboardId));
}
