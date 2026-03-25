"use client";
import { Trash2, BarChart2, Calendar, HardDrive, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmDialog";

type HubCardProps = {
  id: string;
  name: string;
  date: string;
  status: string;
};

export function HubCard({ id, name, date, status }: HubCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [deleting, setDeleting] = useState(false);

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
      router.refresh();
    } catch (error) {
      toast("error", "Erro ao deletar. Tente novamente.");
      setDeleting(false);
    }
  };

  return (
    <Link
      href={`/dashboard/bi/${id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
    >
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <BarChart2 className="h-6 w-6" />
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            title="Excluir BI"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        <h3 className="mb-1 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-700">
          {name}
        </h3>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-emerald-600">
          <HardDrive className="h-4 w-4" />
          <span className="font-medium capitalize">
            {status === "ready" ? "Processado e Pronto" : status}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
        <span className="text-sm font-semibold text-indigo-600">
          Acessar Painel
        </span>
        <span className="transform text-indigo-600 transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
