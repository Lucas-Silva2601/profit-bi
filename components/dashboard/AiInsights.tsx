"use client";
import { useState } from "react";
import { Sparkles, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

export type InsightData = {
  totalVolume: string;
  totalSales: string;
  ticketMedio: string;
  topCategory: string;
};

export function AiInsights({ data }: { data: InsightData }) {
  const { toast } = useToast();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Desconhecido");
      setInsight(json.insight);
    } catch (e: any) {
      toast("error", "Erro ao buscar análise da IA: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900 to-indigo-700 p-6 text-white shadow-md">
      {/* Decorative effect */}
      <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="h-48 w-48" />
      </div>

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between xl:justify-start xl:gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-300" />
            <h3 className="text-lg font-bold">
              Conselheiro de IA{" "}
              <span className="ml-1 text-sm font-medium text-indigo-300">
                Powered by Ollama Cloud
              </span>
            </h3>
          </div>
          {!insight && (
            <button
              onClick={fetchInsight}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Analisar Faturamento Agora
            </button>
          )}
        </div>

        {insight ? (
          <div className="rounded-lg border border-white/5 bg-white/10 p-5 text-sm leading-relaxed whitespace-pre-wrap text-indigo-50 backdrop-blur-md">
            {insight}
          </div>
        ) : (
          <p className="text-sm text-indigo-200">
            Deixe a IA gerar uma análise de especialista instantânea com as
            metas e tendências detectadas nos seus dados.
          </p>
        )}
      </div>
    </div>
  );
}
