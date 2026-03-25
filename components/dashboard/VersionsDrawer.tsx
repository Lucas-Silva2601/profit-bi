"use client";
import { useState } from "react";
import {
  X,
  History,
  RotateCcw,
  Loader2,
  KanbanSquare,
  LayoutDashboard,
} from "lucide-react";
import {
  restoreLayoutVersion,
  type DashboardVersion,
} from "@/app/actions/versions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";

type Props = {
  dashboardId: string;
  versions: DashboardVersion[];
  onClose: () => void;
};

export function VersionsDrawer({ dashboardId, versions, onClose }: Props) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [restoring, setRestoring] = useState<number | null>(null);
  const router = useRouter();

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  const handleRestore = async (index: number) => {
    const confirmed = await confirm({
      title: "Restaurar Versão",
      message: `Restaurar "${versions[index].label}"? O estado atual será salvo como nova versão.`,
      confirmLabel: "Restaurar",
      cancelLabel: "Cancelar",
      variant: "warning",
    });

    if (!confirmed) return;

    try {
      setRestoring(index);
      await restoreLayoutVersion(dashboardId, index);
      toast("success", `Versão "${versions[index].label}" restaurada com sucesso.`);
      router.refresh();
      onClose();
    } catch (e: any) {
      toast("error", "Erro ao restaurar: " + e.message);
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="animate-in slide-in-from-right-full relative z-10 flex w-full max-w-sm flex-col bg-white shadow-2xl duration-300">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Histórico de Versões
              </h2>
              <p className="text-xs text-slate-300">
                {versions.length} versão(ões) salva(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {versions.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center text-sm text-gray-400">
              <History className="h-10 w-10 opacity-30" />
              <div>
                <p className="font-medium">Nenhuma versão salva</p>
                <p className="mt-1 text-xs text-gray-400">
                  Versões são salvas automaticamente ao clicar em "Atualizar IA"
                </p>
              </div>
            </div>
          ) : (
            versions.map((version, i) => (
              <div
                key={version.timestamp}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${i === 0 ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {i === 0 ? "Mais recente" : version.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      {formatDate(version.timestamp)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <KanbanSquare className="h-3 w-3" />
                        <span>{version.kpisCount} KPIs</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <LayoutDashboard className="h-3 w-3" />
                        <span>{version.chartsCount} gráficos</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(i)}
                    disabled={restoring !== null}
                    className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                  >
                    {restoring === i ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restaurar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-5 py-3">
          <p className="text-center text-[10px] text-gray-400">
            Até 5 versões são mantidas automaticamente. Restaurar preserva o
            estado atual como nova versão.
          </p>
        </div>
      </div>
    </div>
  );
}
