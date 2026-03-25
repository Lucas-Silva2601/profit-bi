"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingCart,
  EyeOff,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { ResizeHandle } from "./ResizeHandle";

export type KPI = {
  title: string;
  value: string;
  numericValue: number;
  change: string;
  trend: "up" | "down";
  iconName: "dollar" | "users" | "cart";
};

const iconMap = { dollar: DollarSign, users: Users, cart: ShoppingCart };
const iconMapAll = {
  dollar: DollarSign,
  users: Users,
  cart: ShoppingCart,
  trending: TrendingUp,
  activity: Activity,
  chart: BarChart3,
};

const gradientSets = [
  {
    from: "from-rose-500",
    to: "to-pink-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-cyan-500",
    to: "to-blue-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-amber-500",
    to: "to-orange-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-violet-500",
    to: "to-purple-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-emerald-500",
    to: "to-teal-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-indigo-500",
    to: "to-blue-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-fuchsia-500",
    to: "to-pink-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
  {
    from: "from-sky-500",
    to: "to-cyan-600",
    bg: "bg-gradient-to-br",
    icon: "bg-white/20",
  },
];

function generateSparklineData(count: number, trend: "up" | "down") {
  const data: number[] = [];
  let val = 30 + Math.random() * 40;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - (trend === "up" ? 0.35 : 0.65)) * 15;
    val = Math.max(10, Math.min(90, val + change));
    data.push(val);
  }
  return data;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const width = 120;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="opacity-60">
      <defs>
        <linearGradient
          id={`spark-grad-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  data: KPI[];
  goals?: Record<string, number>;
  titleOverrides?: Record<string, string>;
  hiddenKpis?: Set<string>;
  onHide?: (title: string) => void;
  onSetGoal?: (title: string, value: number | null) => void;
  onRenameTitle?: (originalTitle: string, newTitle: string) => void;
  kpiSizes?: Record<string, { w: number; h: number }>;
  onResize?: (title: string, w: number, h: number) => void;
};

export function KPICards({
  data,
  goals = {},
  titleOverrides = {},
  hiddenKpis = new Set(),
  kpiSizes = {},
  onHide,
  onSetGoal,
  onRenameTitle,
  onResize,
}: Props) {
  const [goalEditing, setGoalEditing] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  const visible = data.filter((kpi) => !hiddenKpis.has(kpi.title));

  const commitGoal = (title: string) => {
    const v = parseFloat(goalInput);
    if (!isNaN(v) && v > 0) onSetGoal?.(title, v);
    setGoalEditing(null);
  };

  const commitRename = (original: string) => {
    const trimmed = renameInput.trim();
    if (trimmed && trimmed !== original) onRenameTitle?.(original, trimmed);
    setRenaming(null);
  };

  return (
    <div className="flex flex-wrap items-stretch gap-3 w-full">
      {visible.map((kpi, idx) => {
        const Icon = iconMap[kpi.iconName] || DollarSign;
        const label = titleOverrides[kpi.title] ?? kpi.title;
        const goal = goals[kpi.title];
        const progress = goal
          ? Math.min(100, Math.round((kpi.numericValue / goal) * 100))
          : null;
        const gradient = gradientSets[idx % gradientSets.length];
        const sparkData = generateSparklineData(12, kpi.trend);
        const sparkColor = kpi.trend === "up" ? "#34d399" : "#f87171";

        const savedSize = kpiSizes[kpi.title];
        const initialWidth =
          savedSize?.w && savedSize.w > 100
            ? `${savedSize.w}px`
            : "calc(25% - 12px)";
        const initialHeight =
          savedSize?.h && savedSize.h > 80
            ? `${savedSize.h}px`
            : undefined;

        return (
          <div
            key={kpi.title}
            className={`relative ${gradient.bg} ${gradient.from} ${gradient.to} rounded-xl shadow-lg overflow-hidden transition-all group`}
            style={{
              minWidth: "200px",
              maxWidth: "1200px",
              minHeight: "120px",
              maxHeight: "400px",
              width: initialWidth,
              height: initialHeight,
              flexBasis: "auto",
            }}
          >
            <ResizeHandle
              onResize={(w, h) => onResize?.(kpi.title, w, h)}
              minWidth={200}
              maxWidth={1200}
              minHeight={120}
              maxHeight={400}
              currentWidth={savedSize?.w}
              currentHeight={savedSize?.h}
            />
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-6 -translate-x-6" />
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              {onHide && (
                <button
                  onClick={() => onHide(kpi.title)}
                  title="Ocultar este KPI"
                  className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative p-4 md:p-5 flex flex-col h-full">
              {/* Top row: label + icon */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 pr-8 flex-1">
                  {renaming === kpi.title ? (
                    <input
                      autoFocus
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onBlur={() => commitRename(kpi.title)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(kpi.title);
                        if (e.key === "Escape") setRenaming(null);
                      }}
                      className="text-[11px] font-bold text-white/80 uppercase tracking-wider border-b border-white/40 outline-none bg-transparent w-full mb-0.5"
                    />
                  ) : (
                    <p
                      className="text-[11px] font-bold text-white/70 mb-0.5 uppercase tracking-wider cursor-default"
                      title="Clique duplo para renomear"
                      onDoubleClick={() => {
                        setRenaming(kpi.title);
                        setRenameInput(label);
                      }}
                    >
                      {label}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${gradient.icon} flex items-center justify-center backdrop-blur-sm`}
                  >
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  {onSetGoal && (
                    <button
                      onClick={() => {
                        setGoalEditing(kpi.title);
                        setGoalInput(goal?.toString() ?? "");
                      }}
                      title={
                        goal
                          ? `Meta: ${goal.toLocaleString("pt-BR")}`
                          : "Definir meta"
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Target
                        className={`w-3.5 h-3.5 ${goal ? "text-white" : "text-white/40"}`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Value */}
              <h3
                className="text-2xl md:text-3xl font-extrabold text-white tracking-tight"
                style={{ wordBreak: "break-word" }}
              >
                {kpi.value}
              </h3>

              {/* Trend + Sparkline */}
              <div className="flex items-center justify-between mt-3">
                <div
                  className={`flex items-center gap-1 text-[12px] font-bold ${kpi.trend === "up" ? "text-emerald-200" : "text-red-200"}`}
                >
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{kpi.change}</span>
                </div>
                <Sparkline data={sparkData} color={sparkColor} />
              </div>

              {/* Goal progress */}
              {goal !== undefined && progress !== null && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex justify-between text-[10px] font-semibold mb-1.5">
                    <span className="text-white/70">{progress}% da meta</span>
                    <span className="text-white/50">
                      {goal.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${progress >= 100 ? "bg-emerald-300" : "bg-white/80"}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Goal popover */}
            {goalEditing === kpi.title && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 min-w-[220px]">
                <p className="text-[11px] font-bold text-slate-300 mb-2">
                  Meta para: <span className="text-white">{label}</span>
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="number"
                    value={goalInput}
                    autoFocus
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitGoal(kpi.title);
                      if (e.key === "Escape") setGoalEditing(null);
                    }}
                    placeholder="Ex: 500000"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => commitGoal(kpi.title)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500"
                    >
                      OK
                    </button>
                    {goal !== undefined && (
                      <button
                        onClick={() => {
                          onSetGoal?.(kpi.title, null);
                          setGoalEditing(null);
                        }}
                        className="flex-1 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium hover:bg-red-500/30"
                      >
                        Remover
                      </button>
                    )}
                    <button
                      onClick={() => setGoalEditing(null)}
                      className="px-3 py-2 bg-slate-700 rounded-lg text-xs text-slate-300 hover:bg-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
