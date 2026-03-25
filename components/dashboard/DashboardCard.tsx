"use client";

import Link from "next/link";
import { BarChart2, Calendar, HardDrive, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";
import { useTheme } from "@/components/ThemeProvider";

type DashboardCardProps = {
  id: string;
  name: string;
  status: string;
  date: string;
  onSuccess?: () => void;
};

export function DashboardCard({ id, name, status, date, onSuccess }: DashboardCardProps) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deleting, setDeleting] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await confirm({
      title: "Excluir Dashboard",
      message: `Tem certeza que deseja excluir "${name}" e todos os seus dados? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/datasets/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: id }),
      });
      if (!res.ok) throw new Error("Falha na exclusão");
      toast("success", `"${name}" foi excluído com sucesso.`);
      onSuccess?.();
    } catch {
      toast("error", "Erro ao deletar. Tente novamente.");
      setDeleting(false);
    }
  };

  return (
    <Link
      href={`/dashboard/bi/${id}`}
      className={`group relative flex flex-col justify-between rounded-xl border p-5 shadow-lg transition-all ${isDark ? "border-slate-800 bg-slate-900/80 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5" : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100"}`}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "from-indigo-500/5 to-violet-500/5" : "from-indigo-50 to-violet-50"}`} />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:bg-indigo-500/20 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
            <BarChart2 className="h-6 w-6" />
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`cursor-pointer rounded-lg p-2 transition-colors disabled:opacity-50 ${isDark ? "text-slate-600 hover:bg-red-500/10 hover:text-red-400" : "text-gray-400 hover:bg-red-50 hover:text-red-500"}`}
            title="Excluir BI"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <h3 className={`mb-3 line-clamp-2 text-lg font-bold transition-colors group-hover:text-indigo-500 ${isDark ? "text-white group-hover:text-indigo-300" : "text-gray-900"}`}>
          {name}
        </h3>

        <div className={`mt-3 flex items-center gap-1.5 text-sm ${isDark ? "text-slate-500" : "text-gray-500"}`}>
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-emerald-500">
          <HardDrive className="h-4 w-4" />
          <span className="font-medium capitalize">
            {status === "ready" ? "Processado e Pronto" : status}
          </span>
        </div>
      </div>

      <div className={`mt-5 flex items-center justify-between border-t pt-4 relative ${isDark ? "border-slate-800" : "border-gray-100"}`}>
        <span className={`text-sm font-semibold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
          Acessar Painel
        </span>
        <span className={`transform transition-transform group-hover:translate-x-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
          →
        </span>
      </div>
    </Link>
  );
}
