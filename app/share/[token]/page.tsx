import { db } from "@/db";
import { dashboards, datasets, datasetRows } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { KPI } from "@/components/dashboard/KPICards";
import { ChartConfig } from "@/components/dashboard/DynamicChart";
import { FullscreenDashboard } from "@/components/dashboard/FullscreenDashboard";
import { SharePasswordGate } from "@/components/dashboard/SharePasswordGate";
import { Hexagon, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { incrementViewCount } from "@/app/actions/share";
import {
  aggregateKPI,
  aggregateChartData,
  getAvailableFilters,
  applyFilters,
} from "@/utils/aggregation";

export const revalidate = 60;

export default async function PublicDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await params;

  const dashboardsFound = await db
    .select({
      id: dashboards.id,
      name: dashboards.name,
      workspaceId: dashboards.workspaceId,
      layoutConfig: dashboards.layoutConfig,
    })
    .from(dashboards)
    .where(and(eq(dashboards.publicShareToken, token), isNull(dashboards.deletedAt)))
    .limit(1);

  if (dashboardsFound.length === 0) {
    notFound();
  }

  const dashboard = dashboardsFound[0];
  const layout = dashboard.layoutConfig as any;
  const shareSettings = layout?.shareSettings ?? {};

  // ── Verificar expiração ─────────────────────────────────────────────────────
  if (
    shareSettings.expiresAt &&
    new Date(shareSettings.expiresAt) < new Date()
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <Clock className="mb-4 h-12 w-12 text-red-400" />
        <h1 className="mb-2 text-xl font-bold text-gray-800">Link expirado</h1>
        <p className="text-sm text-gray-500">
          Este link de compartilhamento não está mais ativo.
          <br />
          Solicite um novo link ao proprietário do painel.
        </p>
      </div>
    );
  }

  // ── Verificar senha ─────────────────────────────────────────────────────────
  const sp = await searchParams;
  if (shareSettings.password) {
    const submittedPwd = typeof sp["p"] === "string" ? sp["p"] : null;
    if (submittedPwd !== shareSettings.password) {
      return <SharePasswordGate token={token} />;
    }
  }

  // ── Incrementar visualizações ───────────────────────────────────────────────
  // Fire-and-forget (não bloqueia renderização)
  incrementViewCount(dashboard.id).catch(() => {});

  if (!layout || !layout.kpis || !layout.charts) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center text-gray-500">
        <Hexagon className="mb-4 h-12 w-12 text-gray-400" />
        <p className="text-xl font-medium">
          Este Dashboard Público ainda não foi configurado pela IA.
        </p>
        <p className="text-sm">
          O proprietário precisa gerar as visões no painel administrativo.
        </p>
      </div>
    );
  }

  const latestDataset = await db
    .select({ id: datasets.id, name: datasets.name })
    .from(datasets)
    .where(eq(datasets.id, dashboard.name)) // O "name" do Dashboard salva o ID real do dataset respectivo dele
    .limit(1);

  if (latestDataset.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum dado vinculado a este dashboard.
      </div>
    );
  }

  const rowsData = (await db
    .select({ row_data: datasetRows.rowData })
    .from(datasetRows)
    .where(eq(datasetRows.datasetId, latestDataset[0].id))
    .limit(20000)) as { row_data: Record<string, unknown> }[];

  if (rowsData.length === 0) {
    return <div className="p-8 text-center text-gray-500">Dataset vazio.</div>;
  }

  // Engine: Discovery de Extremos e Mapeamento Categórico dos Filtros da IA
  const filtersConfig = layout.filters || [];
  const availableFilters = getAvailableFilters(rowsData, filtersConfig);

  // Engine: Restriction de Scope baseado nos Parâmetros de URL do Usuário
  // sp já foi resolvido acima para verificação de senha
  const { filteredRows, activeFilters } = applyFilters(
    rowsData,
    filtersConfig,
    sp,
  );

  // 1. Processar KPIs
  const generatedKpis: KPI[] = layout.kpis.map((kpi: any) =>
    aggregateKPI(filteredRows, kpi),
  );

  // 2. Processar Gráficos
  const generatedCharts = layout.charts.map((chart: any) =>
    aggregateChartData(filteredRows, chart),
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="z-20 flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-inner">
            <Hexagon className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
            Profit BI{" "}
            <span className="font-light text-gray-400">| Visão Pública</span>
          </span>
        </div>
      </header>

      {/* Simula o Container (main) do Painel Administrativo, permitindo ao FullscreenDashboard expandir identicamente */}
      <main className="animate-in fade-in flex-1 overflow-hidden p-8 duration-500">
        <FullscreenDashboard
          dashboardId={dashboard.id}
          title="DASHBOARD AUTOGERADO"
          datasetName={latestDataset[0].name}
          kpis={generatedKpis}
          charts={generatedCharts}
          availableFilters={availableFilters}
          activeFilters={activeFilters}
          isPublic={true}
        />
      </main>
    </div>
  );
}
