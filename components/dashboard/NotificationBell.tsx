"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Target, TrendingDown, CheckCircle, X } from "lucide-react";
import type { KPI } from "./KPICards";

type Alert = {
  id: string;
  type: "achieved" | "warning" | "critical";
  label: string;
  message: string;
  progress: number;
};

type Props = {
  kpis: KPI[];
  goals: Record<string, number>;
  titleOverrides?: Record<string, string>;
  onRemoveGoal?: (title: string) => void;
};

export function NotificationBell({ kpis, goals, titleOverrides = {}, onRemoveGoal }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const alerts: Alert[] = kpis
    .filter(kpi => goals[kpi.title] !== undefined && goals[kpi.title] > 0)
    .map(kpi => {
      const goal     = goals[kpi.title];
      const progress = kpi.numericValue / goal;
      const label    = titleOverrides[kpi.title] ?? kpi.title;
      const pct      = Math.round(progress * 100);

      if (progress >= 1) return { id: kpi.title, type: "achieved" as const, label, message: `${pct}% da meta — parabéns! 🎉`, progress: pct };
      if (progress >= 0.75) return { id: kpi.title, type: "warning" as const, label, message: `${pct}% da meta — quase lá!`, progress: pct };
      return { id: kpi.title, type: "critical" as const, label, message: `${pct}% da meta — atenção necessária`, progress: pct };
    });

  const criticalCount = alerts.filter(a => a.type === "critical").length;
  const warningCount  = alerts.filter(a => a.type === "warning").length;
  const count = alerts.length;

  const bellColor = criticalCount > 0 ? "text-red-500" : warningCount > 0 ? "text-amber-500" : "text-emerald-500";
  const badgeBg   = criticalCount > 0 ? "bg-red-500"  : warningCount > 0 ? "bg-amber-500"  : "bg-emerald-500";

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (count === 0) {
    return (
      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors print:hidden" title="Sem notificações de metas">
        <Bell className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div ref={ref} className="relative print:hidden">
      <button onClick={() => setOpen(v => !v)} title={`${count} alerta(s) de meta`}
        className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell className={`w-4 h-4 ${bellColor}`} />
        <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center ${badgeBg}`}>
          {count}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-80 z-50 overflow-hidden animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-800">Alertas de Metas</h3>
            </div>
            <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-gray-200 text-gray-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {alerts.map(a => {
              const Icon = a.type === "achieved" ? CheckCircle : a.type === "warning" ? Target : TrendingDown;
              const colors = a.type === "achieved"
                ? { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700", bar: "bg-emerald-500" }
                : a.type === "warning"
                ? { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", text: "text-amber-700", bar: "bg-amber-500" }
                : { bg: "bg-red-50", icon: "bg-red-100 text-red-600", text: "text-red-700", bar: "bg-red-500" };

              return (
                <div key={a.id} className={`group flex items-start gap-3 px-4 py-3 relative ${colors.bg}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${colors.icon}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-[11px] font-bold text-gray-700 truncate">{a.label}</p>
                    <p className={`text-xs ${colors.text} mt-0.5`}>{a.message}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                      <div className={`h-1 rounded-full ${colors.bar} transition-all`} style={{ width: `${Math.min(100, a.progress)}%` }} />
                    </div>
                  </div>
                  {onRemoveGoal && (
                    <button onClick={() => onRemoveGoal(a.id)} title="Excluir Meta"
                      className="absolute top-3 right-4 p-1 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-red-500 transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] text-gray-400 text-center">Metas configuradas via ícone 🎯 nos KPI cards</p>
          </div>
        </div>
      )}
    </div>
  );
}
