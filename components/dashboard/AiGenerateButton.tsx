"use client";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AiGenerateButton({ datasetId, workspaceId }: { datasetId: string, workspaceId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, workspaceId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Desconhecido");
      
      // Sucesso! Atualizar a página para o Server Component ler o novo JSON!
      router.refresh();
    } catch (e: any) {
      alert("Erro ao pedir pro Agente IA criar o Painel: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mx-auto mt-8"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          IA Estudando suas colunas e criando gráficos (aprox. 10s)...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 text-indigo-200" />
          Gerar Dashboard com Inteligência Artificial (Ollama Cloud · Gemma 4)
        </>
      )}
    </button>
  );
}
