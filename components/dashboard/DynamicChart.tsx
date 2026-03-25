"use client";
import { useRef, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ZAxis,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { Download, EyeOff, StickyNote, Maximize2 } from "lucide-react";

export type ChartConfig = {
  title: string;
  type: "line" | "bar" | "area" | "pie" | "scatter";
  xAxisColumn: string;
  yAxisColumn: string;
  yAggregation: string;
  description?: string;
};

export type DynamicChartProps = {
  config: ChartConfig;
  data: any[];
  primaryColor?: string;
  secondaryColor?: string;
  typeOverride?: "line" | "bar" | "area" | "pie" | "scatter";
  titleOverride?: string;
  note?: string;
  dataQuality?: { validRows: number; invalidRows: number; invalidRatio: number };
  onHide?: () => void;
  onTypeChange?: (type: "line" | "bar" | "area" | "pie" | "scatter") => void;
  onRenameTitle?: (original: string, newTitle: string) => void;
  onSaveNote?: (chartTitle: string, note: string) => void;
};

const DARK_COLORS = [
  "#818cf8",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#fb7185",
  "#6366f1",
  "#2dd4bf",
  "#f97316",
  "#c084fc",
  "#0ea5e9",
];

const CHART_GRADIENTS = [
  { primary: "#818cf8", secondary: "#6366f1", accent: "#a5b4fc" },
  { primary: "#38bdf8", secondary: "#0284c7", accent: "#7dd3fc" },
  { primary: "#a78bfa", secondary: "#7c3aed", accent: "#c4b5fd" },
  { primary: "#f472b6", secondary: "#db2777", accent: "#fbcfe8" },
  { primary: "#fbbf24", secondary: "#d97706", accent: "#fde68a" },
  { primary: "#34d399", secondary: "#059669", accent: "#6ee7b7" },
  { primary: "#fb7185", secondary: "#e11d48", accent: "#fecdd3" },
  { primary: "#2dd4bf", secondary: "#0d9488", accent: "#99f6e4" },
];

function formatNumber(val: any): string {
  if (isNaN(Number(val))) return String(val);
  const num = Number(val);
  if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `R$ ${(num / 1000).toFixed(1)}K`;
  if (num >= 100) return `R$ ${num.toFixed(0)}`;
  return `R$ ${num.toFixed(2)}`;
}

function formatShort(val: any): string {
  if (isNaN(Number(val))) return String(val);
  const num = Number(val);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return String(num);
}

export function DynamicChart({
  config,
  data,
  primaryColor = "#818cf8",
  secondaryColor = "#38bdf8",
  typeOverride,
  titleOverride,
  note,
  dataQuality,
  onHide,
  onTypeChange,
  onRenameTitle,
  onSaveNote,
}: DynamicChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState(titleOverride ?? config.title);
  const [showNote, setShowNote] = useState(false);
  const [noteInput, setNoteInput] = useState(note ?? "");

  const effectiveType = typeOverride ?? config.type;
  const displayTitle = titleOverride ?? config.title;

  const commitRename = () => {
    const trimmed = renameInput.trim();
    if (trimmed && trimmed !== config.title)
      onRenameTitle?.(config.title, trimmed);
    setIsRenaming(false);
  };

  const handleDownloadPNG = () => {
    const svgEl = containerRef.current?.querySelector("svg");
    if (!svgEl) return;
    const { width, height } = svgEl.getBoundingClientRect();
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(pngBlob);
        a.download = `${config.title.replace(/\s+/g, "_")}.png`;
        a.click();
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!data || data.length === 0)
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl bg-slate-800/50 p-6 text-slate-500 border border-slate-700/50">
        Sem dados para o gráfico "{config.title}".
      </div>
    );

  const gradientIdx =
    Math.abs(config.title.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
    CHART_GRADIENTS.length;
  const grad = CHART_GRADIENTS[gradientIdx];

  const ChartWrapper =
    effectiveType === "bar"
      ? BarChart
      : effectiveType === "area"
        ? AreaChart
        : effectiveType === "pie"
          ? PieChart
          : effectiveType === "scatter"
            ? ScatterChart
            : LineChart;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-[11px] font-bold text-slate-300 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p
            key={i}
            className="text-xs font-semibold"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="group flex h-full w-full flex-col bg-transparent"
    >
      {/* Header */}
      <div className="mb-2 flex flex-shrink-0 items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <input
              autoFocus
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setIsRenaming(false);
              }}
              className="mb-1 w-full border-b border-indigo-400 bg-transparent text-sm font-bold tracking-tight text-indigo-300 outline-none"
            />
          ) : (
            <h3
              className="cursor-default truncate text-sm leading-none font-bold tracking-tight text-white"
              title="Clique duplo para renomear"
              onDoubleClick={() => {
                setIsRenaming(true);
                setRenameInput(displayTitle);
              }}
            >
              {displayTitle}
            </h3>
          )}
          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500 uppercase">
            {config.yAggregation} ~ {config.yAxisColumn} × {config.xAxisColumn}
          </p>
          {config.description && (
            <p className="mt-0.5 truncate text-[10px] text-slate-500 italic">
              {config.description}
            </p>
          )}
          {dataQuality && dataQuality.invalidRatio > 20 && (
            <div className="mt-1 flex items-center gap-1">
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                ⚠ {dataQuality.invalidRatio}% dados inválidos
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 print:hidden">
          {onTypeChange && (
            <div className="flex gap-0.5">
              {(["line", "bar", "area", "pie", "scatter"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onTypeChange(t)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors ${
                    effectiveType === t
                      ? "bg-indigo-500/30 text-indigo-300"
                      : "text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                  }`}
                >
                  {t === "line"
                    ? "∿"
                    : t === "bar"
                      ? "▌"
                      : t === "area"
                        ? "◟"
                        : t === "pie"
                          ? "◔"
                          : "⋮"}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={handleDownloadPNG}
            title="Baixar como PNG"
            className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {onSaveNote && (
            <button
              onClick={() => {
                setNoteInput(note ?? "");
                setShowNote((v) => !v);
              }}
              title={note ? "Editar nota" : "Adicionar nota"}
              className={`rounded p-1 transition-colors ${note ? "text-amber-400" : "text-slate-500 hover:text-amber-400 hover:bg-slate-700"}`}
            >
              <StickyNote className="h-3.5 w-3.5" />
            </button>
          )}
          {onHide && (
            <button
              onClick={onHide}
              title="Ocultar gráfico"
              className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Note closed */}
      {!showNote && note && (
        <div
          onClick={() => {
            setNoteInput(note);
            setShowNote(true);
          }}
          className="mb-2 flex-shrink-0 cursor-pointer"
        >
          <p className="truncate rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300 transition-colors hover:bg-amber-500/20">
            📌 {note}
          </p>
        </div>
      )}

      {/* Note popover */}
      {showNote && onSaveNote && (
        <div className="animate-in slide-in-from-top-1 mb-2 flex-shrink-0 duration-150">
          <div className="flex items-end gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
            <textarea
              autoFocus
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Nota contextual (ex: Pico = Black Friday)..."
              rows={2}
              className="flex-1 resize-none rounded border border-amber-500/30 bg-slate-800 px-2 py-1 text-xs text-white placeholder-slate-500 focus:border-amber-500/60 focus:outline-none"
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onSaveNote(config.title, noteInput);
                  setShowNote(false);
                }}
                className="rounded bg-amber-500 px-2 py-1 text-[10px] font-bold text-slate-900 transition-colors hover:bg-amber-400"
              >
                OK
              </button>
              <button
                onClick={() => setShowNote(false)}
                className="rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-300 transition-colors hover:bg-slate-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="relative min-h-0 w-full flex-1">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={10}
          minHeight={10}
        >
          <ChartWrapper
            data={data}
            margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
          >
            {effectiveType === "area" && (
              <defs>
                <linearGradient
                  id={`color-${config.yAxisColumn}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={grad.primary}
                    stopOpacity={0.4}
                  />
                  <stop offset="95%" stopColor={grad.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}

            {effectiveType !== "pie" && (
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            )}

            {effectiveType === "scatter" ? (
              <>
                <XAxis
                  dataKey="xValue"
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  width={55}
                  tickFormatter={formatShort}
                />
                <ZAxis range={[60, 400]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter dataKey="yValue" fill={grad.primary}>
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DARK_COLORS[index % DARK_COLORS.length]}
                    />
                  ))}
                </Scatter>
              </>
            ) : effectiveType === "pie" ? (
              <>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  dataKey="yValue"
                  nameKey="xValue"
                  cx="50%"
                  cy="50%"
                  innerRadius={data.length <= 4 ? 40 : 55}
                  outerRadius={data.length <= 4 ? 70 : 85}
                  label={({ name, percent }: any) =>
                    data.length <= 8
                      ? `${name} ${(percent * 100).toFixed(0)}%`
                      : ""
                  }
                  labelLine={{ stroke: "#475569" }}
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={DARK_COLORS[index % DARK_COLORS.length]}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </>
            ) : (
              <>
                <XAxis
                  dataKey="xValue"
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  width={55}
                  tickFormatter={formatShort}
                />
                <Tooltip
                  cursor={{
                    fill: "rgba(99, 102, 241, 0.05)",
                    stroke: "#334155",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={<CustomTooltip />}
                />
                {effectiveType === "bar" && (
                  <Bar dataKey="yValue" radius={[4, 4, 0, 0]} barSize={28}>
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DARK_COLORS[index % DARK_COLORS.length]}
                      />
                    ))}
                  </Bar>
                )}
                {effectiveType === "area" && (
                  <Area
                    type="monotone"
                    dataKey="yValue"
                    stroke={grad.primary}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#color-${config.yAxisColumn})`}
                  />
                )}
                {effectiveType === "line" && (
                  <Line
                    type="monotone"
                    dataKey="yValue"
                    stroke={grad.primary}
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                      strokeWidth: 2,
                      fill: "#0f172a",
                      stroke: grad.primary,
                    }}
                    activeDot={{
                      r: 5,
                      fill: grad.primary,
                      stroke: "#0f172a",
                      strokeWidth: 2,
                    }}
                  />
                )}
              </>
            )}
          </ChartWrapper>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
