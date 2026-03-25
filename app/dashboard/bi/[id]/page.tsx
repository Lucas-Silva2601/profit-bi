import { db } from "@/db";
import { dashboards, datasets, datasetRows } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { FullscreenDashboard } from "@/components/dashboard/FullscreenDashboard";
import { AutoBuilder } from "@/components/dashboard/AutoBuilder";
import { KPI } from "@/components/dashboard/KPICards";
import { ChartConfig } from "@/components/dashboard/DynamicChart";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/utils/session";
import { getOrCreateWorkspace } from "@/utils/workspace";
import {
  aggregateKPI,
  aggregateChartData,
  getAvailableFilters,
  applyFilters,
} from "@/utils/aggregation";

export default async function BIDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  let workspaceId: string;
  try {
    workspaceId = await getOrCreateWorkspace(user.id);
  } catch {
    return <div className="p-8 text-center text-red-500">Erro Crítico.</div>;
  }

  // Fetch Specific Dataset (escopo do workspace do usuário)
  const datasetsFound = await db
    .select({ id: datasets.id, name: datasets.name, status: datasets.status, updatedAt: datasets.updatedAt })
    .from(datasets)
    .where(and(eq(datasets.id, id), eq(datasets.workspaceId, workspaceId)))
    .limit(1);

  if (datasetsFound.length === 0) {
    notFound();
  }
  const dataset = datasetsFound[0];

  // Busca do Dashboard configurado pela IA
  const dashs = await db
    .select({
      id: dashboards.id,
      name: dashboards.name,
      layoutConfig: dashboards.layoutConfig,
      publicShareToken: dashboards.publicShareToken,
    })
    .from(dashboards)
    .where(and(eq(dashboards.name, dataset.id), isNull(dashboards.deletedAt))) // name carries the dataset id per our new logic
    .limit(1);

  const dashboard = dashs.length > 0 ? dashs[0] : null;
  const layout = dashboard?.layoutConfig as any;

  // Extrai cores da marca salvas no layout (fallback para indigo/cyan padrão)
  const primaryColor: string = layout?.brandColors?.primary ?? "#4F46E5";
  const secondaryColor: string = layout?.brandColors?.secondary ?? "#06B6D4";

  if (!layout || !layout.kpis || !layout.charts) {
    return <AutoBuilder datasetId={dataset.id} workspaceId={workspaceId} />;
  }

  // Layout Existe: Machine Engine Actioning
  const rowsData = (await db
    .select({ row_data: datasetRows.rowData })
    .from(datasetRows)
    .where(eq(datasetRows.datasetId, dataset.id))
    .limit(20000)) as { row_data: Record<string, unknown> }[];

  if (rowsData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum dado processável no dataset.
      </div>
    );
  }

  // Engine: Discovery de Extremos e Mapeamento Categórico dos Filtros da IA
  const filtersConfig = layout.filters || [];
  const availableFilters = getAvailableFilters(rowsData, filtersConfig);

  // Engine: Restrição de Scope baseado nos Parâmetros de URL do Usuário
  const sp = await searchParams;
  const { filteredRows, activeFilters } = applyFilters(
    rowsData,
    filtersConfig,
    sp
  );

  /* Aggregation Engine Universal (Rodando sob a lente dos Filtros) */
  const generatedKpis: KPI[] = layout.kpis.map((kpi: any) =>
    aggregateKPI(filteredRows, kpi)
  );

  const generatedCharts = layout.charts.map((chart: any) =>
    aggregateChartData(filteredRows, chart)
  );

  // Dados brutos filtrados para exportação CSV/Excel
  const exportData = filteredRows.map((r) => r.row_data);

  return (
    <FullscreenDashboard
      dashboardId={dashboard?.id || ""}
      datasetId={dataset.id}
      workspaceId={workspaceId}
      title={
        dashboard?.name === dataset.id
          ? "Painel Analítico"
          : dashboard?.name || "Dashboard IA"
      }
      datasetName={dataset.name}
      updatedAt={dataset.updatedAt ? dataset.updatedAt.toISOString() : null}
      kpis={generatedKpis}
      charts={generatedCharts}
      exportData={exportData}
      availableFilters={availableFilters}
      activeFilters={activeFilters}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      versions={layout?.versions ?? []}
    />
  );
}
