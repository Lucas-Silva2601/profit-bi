"use client";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function AutoBuilder({
  datasetId,
  workspaceId,
}: {
  datasetId: string;
  workspaceId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/ai/retry-build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datasetId, workspaceId }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Falha temporária na IA.");
        if (mounted) router.refresh();
      } catch (err: any) {
        if (mounted) setError(err.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [datasetId, workspaceId, router]);

  const handleRetry = async () => {
    setRetrying(true);
    setError("");
    try {
      const res = await fetch("/api/ai/retry-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, workspaceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na IA.");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl animate-pulse" />
        <Loader2 className="relative w-16 h-16 animate-spin text-indigo-400" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h2 className="text-2xl font-bold text-white">
          Gerando seu Dashboard com IA...
        </h2>
      </div>

      <p className="max-w-md mx-auto text-slate-400">
        {error
          ? "A IA encontrou um problema. Tente novamente ou verifique os dados."
          : "A Inteligência Artificial está analisando seus dados e criando gráficos executivos. Aguarde, a tela vai auto-recarregar!"}
      </p>

      {error && (
        <div className="mt-8 bg-red-500/10 text-red-300 p-6 rounded-xl border border-red-500/30 max-w-lg">
          <p className="font-semibold text-sm mb-2">
            Erro na geração do dashboard:
          </p>
          <p className="text-xs font-mono text-red-400 bg-red-500/10 rounded-lg p-3">
            {error}
          </p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-4 flex items-center gap-2 mx-auto text-sm font-bold text-indigo-300 hover:text-indigo-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`}
            />
            {retrying ? "Tentando novamente..." : "Tentar Novamente"}
          </button>
        </div>
      )}
    </div>
  );
}
