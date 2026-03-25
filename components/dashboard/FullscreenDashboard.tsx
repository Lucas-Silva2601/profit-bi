"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { KPICards, KPI } from "./KPICards";
import { DynamicChart, ChartConfig } from "./DynamicChart";
import { DataTableDrawer } from "./DataTableDrawer";
import { AIChatPanel } from "./AIChatPanel";
import { NotificationBell } from "./NotificationBell";
import { VersionsDrawer } from "./VersionsDrawer";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Pencil,
  Loader2,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Clock,
  Eye,
  Table,
  Sparkles,
  History,
  ArrowLeft,
} from "lucide-react";
import { ShareButton } from "./ShareButton";
import { ResizeHandle } from "./ResizeHandle";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";
import { useToast } from "@/components/ToastProvider";

export type FilterOption = {
  column_name: string;
  label: string;
  options: string[];
};

type DashPrefs = {
  hiddenKpis: string[];
  hiddenCharts: string[];
  chartTypeOverrides: Record<
    string,
    "line" | "bar" | "area" | "pie" | "scatter"
  >;
  goals: Record<string, number>;
  kpiTitleOverrides: Record<string, string>;
  chartTitleOverrides: Record<string, string>;
  chartOrder: string[];
  chartNotes: Record<string, string>;
  kpiSizes: Record<string, { w: number; h: number }>;
  chartSizes: Record<string, { w: number; h: number }>;
};

const emptyPrefs = (): DashPrefs => ({
  hiddenKpis: [],
  hiddenCharts: [],
  chartTypeOverrides: {},
  goals: {},
  kpiTitleOverrides: {},
  chartTitleOverrides: {},
  chartOrder: [],
  chartNotes: {},
  kpiSizes: {},
  chartSizes: {},
});

const PREFS_KEY = (id: string) => `profit-bi-prefs-${id}`;

function loadPrefs(dashboardId: string): DashPrefs {
  if (typeof window === "undefined") return emptyPrefs();
  try {
    return {
      ...emptyPrefs(),
      ...JSON.parse(localStorage.getItem(PREFS_KEY(dashboardId)) ?? "{}"),
    };
  } catch {
    return emptyPrefs();
  }
}

function savePrefs(dashboardId: string, prefs: DashPrefs) {
  try {
    localStorage.setItem(PREFS_KEY(dashboardId), JSON.stringify(prefs));
  } catch {
    /* noop */
  }
}

type Props = {
  dashboardId: string;
  datasetId?: string;
  workspaceId?: string;
  title: string;
  datasetName: string;
  updatedAt?: string | null;
  kpis: KPI[];
  charts: { config: ChartConfig; data: any[]; dataQuality?: { validRows: number; invalidRows: number; invalidRatio: number } }[];
  exportData?: Record<string, any>[];
  isPublic?: boolean;
  availableFilters?: FilterOption[];
  activeFilters?: Record<string, string>;
  primaryColor?: string;
  secondaryColor?: string;
  versions?: any[];
};

export function FullscreenDashboard({
  dashboardId,
  datasetId,
  workspaceId,
  title,
  datasetName,
  updatedAt,
  kpis,
  charts,
  exportData = [],
  isPublic,
  availableFilters = [],
  activeFilters = {},
  primaryColor = "#818cf8",
  secondaryColor = "#38bdf8",
  versions = [],
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [prefs, setPrefs] = useState<DashPrefs>(emptyPrefs);
  const [isHydrated, setIsHydrated] = useState(false);
  const updatePrefs = useCallback(
    (patch: Partial<DashPrefs>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        savePrefs(dashboardId, next);
        return next;
      });
    },
    [dashboardId],
  );

  useEffect(() => {
    setPrefs(loadPrefs(dashboardId));
    setIsHydrated(true);
  }, [dashboardId]);

  const hiddenKpisSet = new Set(prefs.hiddenKpis);
  const hiddenChartsSet = new Set(prefs.hiddenCharts);
  const [showHidden, setShowHidden] = useState(false);

  const chartsPerPage = 4;

  const orderedCharts =
    prefs.chartOrder.length > 0
      ? [
          ...(prefs.chartOrder
            .map((t) => charts.find((c) => c.config.title === t))
            .filter(Boolean) as typeof charts),
          ...charts.filter((c) => !prefs.chartOrder.includes(c.config.title)),
        ]
      : charts;

  const visibleCharts = showHidden
    ? orderedCharts
    : orderedCharts.filter((c) => !hiddenChartsSet.has(c.config.title));
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(visibleCharts.length / chartsPerPage) || 1;
  const pageCharts = visibleCharts.slice(
    currentPage * chartsPerPage,
    (currentPage + 1) * chartsPerPage,
  );

  const handleDragStart = (idx: number) => {
    dragSrc.current = idx;
  };
  const handleDrop = (idx: number) => {
    if (dragSrc.current === null || dragSrc.current === idx) return;
    const newOrder = [...visibleCharts.map((c) => c.config.title)];
    const [moved] = newOrder.splice(dragSrc.current, 1);
    newOrder.splice(idx, 0, moved);
    updatePrefs({ chartOrder: newOrder });
    dragSrc.current = null;
  };

  const [showDataTable, setShowDataTable] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const dragSrc = useRef<number | null>(null);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  const handleFilterChange = (colName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(colName);
    else params.set(colName, value);
    router.push(`?${params.toString()}`);
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(datasetName);
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveName = async () => {
    if (editName.trim() === "" || editName === datasetName) {
      setIsEditingName(false);
      setEditName(datasetName);
      return;
    }
    if (!datasetId) return;
    try {
      setIsSavingName(true);
      const { updateDatasetName } = await import("@/app/actions/dataset");
      await updateDatasetName(datasetId, editName);
      setIsEditingName(false);
    } catch (e: any) {
      toast("error", "Erro ao renomear: " + e.message);
      setEditName(datasetName);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleExportExcel = useCallback(() => {
    if (!exportData.length) return toast("error", "Nenhum dado disponível.");
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `${datasetName}_filtrado.xlsx`);
  }, [exportData, datasetName]);

  const handleExportCSV = useCallback(() => {
    if (!exportData.length) return toast("error", "Nenhum dado disponível.");
    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${datasetName}_filtrado.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData, datasetName]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (!datasetId || !workspaceId) return;
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ai/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, workspaceId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (e: any) {
      toast("error", "Erro: " + e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedDate =
    isHydrated && updatedAt
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(updatedAt))
      : null;

  const hasHiddenItems =
    prefs.hiddenKpis.length > 0 || prefs.hiddenCharts.length > 0;

  const handleAIAction = (action: any) => {
    try {
      if (action.type === "HIDE_CHART") {
        updatePrefs({
          hiddenCharts: [...new Set([...prefs.hiddenCharts, action.title])],
        });
      } else if (action.type === "SHOW_CHART") {
        updatePrefs({
          hiddenCharts: prefs.hiddenCharts.filter((c) => c !== action.title),
        });
      } else if (action.type === "CHANGE_CHART_TYPE") {
        updatePrefs({
          chartTypeOverrides: {
            ...prefs.chartTypeOverrides,
            [action.title]: action.newType,
          },
        });
      }
    } catch (e) {
      console.error("Erro na ação:", e);
    }
  };

  return (
    <>
      {showDataTable && (
        <DataTableDrawer
          data={exportData}
          datasetName={datasetName}
          onClose={() => setShowDataTable(false)}
        />
      )}
      {showVersions && (
        <VersionsDrawer
          dashboardId={dashboardId}
          versions={versions}
          onClose={() => setShowVersions(false)}
        />
      )}

      <div className="relative -m-8 flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-950 print:h-auto print:overflow-visible print:bg-white">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
        </div>

        <div
          ref={dashboardRef}
          className="animate-in fade-in relative z-10 flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-4 duration-500"
        >
          {/* ── Header ─────────────────────────────────────────────────────────── */}
          <div className="mb-4 flex flex-shrink-0 items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3 shadow-lg backdrop-blur-sm print:mb-2 print:border-0 print:shadow-none print:bg-white">
            <div className="flex items-center gap-3">
              {!isPublic && (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-indigo-400 print:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
              <div>
                <h1 className="flex items-center text-lg leading-none font-bold tracking-tight text-white uppercase">
                  {title}
                  <div className="ml-2 flex items-center border-l border-slate-700 pl-2 font-extrabold text-indigo-400">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName();
                          }}
                          onBlur={handleSaveName}
                          autoFocus
                          disabled={isSavingName}
                          className="w-48 rounded border border-indigo-500/50 bg-indigo-500/10 px-2 text-sm font-bold text-indigo-300 uppercase outline-none xl:w-64"
                        />
                        {isSavingName && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => !isPublic && setIsEditingName(true)}
                        className={`-ml-1.5 flex items-center gap-1.5 rounded px-1.5 transition-colors ${!isPublic ? "group cursor-text hover:bg-slate-800" : ""}`}
                        title={!isPublic ? "Clique para renomear" : ""}
                      >
                        <span>{editName}</span>
                        {!isPublic && (
                          <Pencil className="h-3.5 w-3.5 text-transparent opacity-70 group-hover:text-indigo-400" />
                        )}
                      </div>
                    )}
                  </div>
                </h1>
                {formattedDate && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500">
                      Atualizado em {formattedDate}
                    </span>
                  </div>
                )}
              </div>

              {/* AI Actions */}
              <div className="ml-4 flex hidden items-center gap-2 border-l border-slate-700 pl-4 sm:flex print:hidden">
                {!isPublic && datasetId && (
                  <button
                    onClick={() => setShowChat(true)}
                    title="Assistente inteligente"
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 hover:opacity-90 active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Chat IA
                  </button>
                )}
                {!isPublic && workspaceId && (
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="Reprocessar painel"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 shadow transition-all hover:scale-105 hover:bg-slate-700 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 text-indigo-400 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    {isRefreshing ? "Atualizando..." : "Atualizar IA"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
              {!isPublic && Object.keys(prefs.goals).length > 0 && (
                <NotificationBell
                  kpis={kpis}
                  goals={prefs.goals}
                  titleOverrides={prefs.kpiTitleOverrides}
                  onRemoveGoal={(title) => {
                    const newGoals = { ...prefs.goals };
                    delete newGoals[title];
                    updatePrefs({ goals: newGoals });
                  }}
                />
              )}

              {/* Filters */}
              {availableFilters
                .filter((f) => f.column_name !== "Aba_Origem")
                .map((filter, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 shadow-sm"
                  >
                    <Filter className="h-3.5 w-3.5 text-indigo-400" />
                    <select
                      value={activeFilters[filter.column_name] || "all"}
                      onChange={(e) =>
                        handleFilterChange(filter.column_name, e.target.value)
                      }
                      className="max-w-[130px] cursor-pointer truncate bg-transparent text-xs font-bold text-slate-200 outline-none"
                    >
                      <option value="all" className="bg-slate-800">
                        Todo {filter.label}
                      </option>
                      {filter.options.map((opt, oIdx) => (
                        <option key={oIdx} value={opt} className="bg-slate-800">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

              <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <select className="cursor-pointer bg-transparent text-xs font-bold text-slate-300 outline-none">
                  <option className="bg-slate-800">Todos os Anos</option>
                </select>
              </div>

              {!isPublic && hasHiddenItems && (
                <button
                  onClick={() => setShowHidden((v) => !v)}
                  title={
                    showHidden
                      ? "Ocultar itens escondidos"
                      : "Mostrar itens ocultos"
                  }
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold shadow-sm transition-all ${
                    showHidden
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                      : "border-slate-700 bg-slate-800/80 text-slate-400 hover:border-indigo-500/50"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {showHidden
                    ? "Ocultar"
                    : `Mostrar (${prefs.hiddenKpis.length + prefs.hiddenCharts.length})`}
                </button>
              )}

              {!isPublic && versions.length > 0 && (
                <button
                  onClick={() => setShowVersions(true)}
                  title="Histórico de versões"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-400 shadow-sm transition-all hover:border-slate-600 hover:text-slate-200"
                >
                  <History className="h-3.5 w-3.5" />
                  Versões ({versions.length})
                </button>
              )}

              {!isPublic && exportData.length > 0 && (
                <button
                  onClick={() => setShowDataTable(true)}
                  title="Explorar dados brutos"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-400 shadow-sm transition-all hover:border-indigo-500/50 hover:text-indigo-300"
                >
                  <Table className="h-3.5 w-3.5" />
                  Dados
                </button>
              )}

              {!isPublic && exportData.length > 0 && (
                <div className="group relative">
                  <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-400 shadow-sm transition-all hover:border-emerald-500/50 hover:text-emerald-300">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Exportar
                  </button>
                  <div className="absolute top-full right-0 z-50 mt-1 hidden w-36 flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl group-hover:flex">
                    <button
                      onClick={handleExportExcel}
                      className="flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <Download className="h-3.5 w-3.5" /> Excel (.xlsx)
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 border-t border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300"
                    >
                      <Download className="h-3.5 w-3.5" /> CSV (.csv)
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => window.print()}
                title="Imprimir / Exportar PDF"
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-400 shadow-sm transition-all hover:border-indigo-500/50 hover:text-indigo-300"
              >
                <Printer className="h-3.5 w-3.5" /> PDF
              </button>

              {!isPublic && <ShareButton dashboardId={dashboardId} />}
            </div>
          </div>

          {/* ── KPIs ──────────────────────────────────────────────────────────── */}
          <div className="z-10 mb-4 w-full flex-shrink-0 print:mb-2">
            <KPICards
              data={kpis}
              goals={prefs.goals}
              kpiSizes={prefs.kpiSizes}
              titleOverrides={prefs.kpiTitleOverrides}
              hiddenKpis={showHidden ? new Set() : hiddenKpisSet}
              onHide={
                !isPublic
                  ? (title) =>
                      updatePrefs({
                        hiddenKpis: [...new Set([...prefs.hiddenKpis, title])],
                      })
                  : undefined
              }
              onSetGoal={
                !isPublic
                  ? (title, val) => {
                      const newGoals = { ...prefs.goals };
                      if (val === null) delete newGoals[title];
                      else newGoals[title] = val;
                      updatePrefs({ goals: newGoals });
                    }
                  : undefined
              }
              onResize={
                !isPublic
                  ? (title: string, w: number, h: number) =>
                      updatePrefs({
                        kpiSizes: { ...prefs.kpiSizes, [title]: { w, h } },
                      })
                  : undefined
              }
              onRenameTitle={
                !isPublic
                  ? (orig, next) =>
                      updatePrefs({
                        kpiTitleOverrides: {
                          ...prefs.kpiTitleOverrides,
                          [orig]: next,
                        },
                      })
                  : undefined
              }
            />
          </div>

          {/* ── Charts ────────────────────────────────────────────────────── */}
          <div
            className={`grid min-h-[450px] flex-1 gap-4 print:grid-cols-2 ${
              pageCharts.length <= 2
                ? "grid-cols-1 grid-rows-1 md:grid-cols-2"
                : pageCharts.length === 3
                  ? "grid-cols-2 grid-rows-2 md:grid-rows-2 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1 md:[&>*:last-child]:col-span-2"
                  : "grid-cols-2 grid-rows-2"
            }`}
          >
            {pageCharts.map((chartItem, globalIdx) => {
              const visIdx = currentPage * chartsPerPage + globalIdx;
              const chartTitle = chartItem.config.title;
              const savedChartSize = prefs.chartSizes[chartTitle];

              return (
                <div
                  key={chartTitle}
                  draggable={!isPublic}
                  onDragStart={() => handleDragStart(visIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(visIdx)}
                  onMouseEnter={() => setHoveredChart(chartTitle)}
                  onMouseLeave={() => setHoveredChart(null)}
                  className={`relative flex min-h-[250px] cursor-grab flex-col justify-stretch overflow-hidden rounded-xl border bg-slate-900/80 p-3 shadow-lg backdrop-blur-sm transition-all active:cursor-grabbing print:break-inside-avoid print:bg-white ${
                    showHidden && hiddenChartsSet.has(chartTitle)
                      ? "border-dashed border-slate-700 opacity-60"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                  style={{
                    width: savedChartSize?.w ? `${savedChartSize.w}px` : undefined,
                    height: savedChartSize?.h ? `${savedChartSize.h}px` : undefined,
                    minWidth: "300px",
                    maxWidth: "1600px",
                    maxHeight: "900px",
                  }}
                >
                  {!isPublic && (
                    <ResizeHandle
                      onResize={(w, h) =>
                        updatePrefs({
                          chartSizes: { ...prefs.chartSizes, [chartTitle]: { w, h } },
                        })
                      }
                      minWidth={300}
                      maxWidth={1600}
                      minHeight={250}
                      maxHeight={900}
                      currentWidth={
                        hoveredChart === chartTitle ? savedChartSize?.w : undefined
                      }
                      currentHeight={
                        hoveredChart === chartTitle ? savedChartSize?.h : undefined
                      }
                    />
                  )}
                  <DynamicChart
                    config={chartItem.config}
                    data={chartItem.data}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    typeOverride={
                      prefs.chartTypeOverrides[chartTitle]
                    }
                    titleOverride={
                      prefs.chartTitleOverrides[chartTitle]
                    }
                    note={prefs.chartNotes[chartTitle]}
                    dataQuality={chartItem.dataQuality}
                    onHide={
                      !isPublic
                        ? () =>
                            updatePrefs({
                              hiddenCharts: [
                                ...new Set([
                                  ...prefs.hiddenCharts,
                                  chartTitle,
                                ]),
                              ],
                            })
                        : undefined
                    }
                    onTypeChange={
                      !isPublic
                        ? (t) =>
                            updatePrefs({
                              chartTypeOverrides: {
                                ...prefs.chartTypeOverrides,
                                [chartTitle]: t,
                              },
                            })
                        : undefined
                    }
                    onRenameTitle={
                      !isPublic
                        ? (orig, next) =>
                            updatePrefs({
                              chartTitleOverrides: {
                                ...prefs.chartTitleOverrides,
                                [orig]: next,
                              },
                            })
                        : undefined
                    }
                    onSaveNote={
                      !isPublic
                        ? (ct, note) =>
                            updatePrefs({
                              chartNotes: {
                                ...prefs.chartNotes,
                                [ct]: note,
                              },
                            })
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-4 flex w-full flex-shrink-0 items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-2 shadow-lg print:hidden">
              <span className="pl-2 text-xs font-bold tracking-widest text-slate-500 uppercase">
                Página {currentPage + 1} / {totalPages}
              </span>
              <div className="flex justify-center gap-2 rounded-full bg-slate-800 p-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-colors ${
                      i === currentPage
                        ? "bg-indigo-500"
                        : "bg-slate-600 hover:bg-slate-500"
                    }`}
                    onClick={() => setCurrentPage(i)}
                  />
                ))}
              </div>
              <div className="flex min-w-[100px] justify-end gap-2 pr-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="rounded-full p-1.5 text-indigo-400 transition-colors hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className="rounded-full p-1.5 text-indigo-400 transition-colors hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && datasetId && (
          <div className="animate-in slide-in-from-right-8 z-20 flex w-80 flex-shrink-0 flex-col border-l border-slate-800 bg-slate-900 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.3)] duration-300 lg:w-96">
            <AIChatPanel
              datasetId={datasetId}
              datasetName={datasetName}
              onClose={() => setShowChat(false)}
              onAction={handleAIAction}
              chartTitles={visibleCharts.map((c) => c.config.title)}
            />
          </div>
        )}
      </div>
    </>
  );
}
