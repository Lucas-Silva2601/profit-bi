"use client";
import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import Link from "next/link";
import { PlusCircle, Search, BarChart2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type Dataset = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export default function HubLobby() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/datasets/list");
        if (res.ok) {
          const data = await res.json();
          setDatasets(data.datasets || []);
        }
      } catch {
        // Silencia erros de rede — mantém a lista vazia
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={`mx-auto max-w-7xl space-y-6 pb-12 animate-in fade-in duration-500`}>
        <div className="flex items-center justify-center h-64">
          <div className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${isDark ? "border-indigo-500" : "border-indigo-600"}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b mb-8 ${isDark ? "border-slate-800" : "border-gray-200"}`}>
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Meus Painéis</h1>
          <p className={`mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Escolha um projeto de inteligência para analisar, ou adicione novos
            dados.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
            <input
              type="text"
              placeholder="Buscar pelo nome..."
              className={`pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[250px] transition-shadow ${isDark ? "bg-slate-800 border border-slate-700 text-white placeholder-slate-500" : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400"}`}
            />
          </div>
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Painel
          </Link>
        </div>
      </div>

      {/* Grid de Cards */}
      {!datasets || datasets.length === 0 ? (
        <div className={`rounded-2xl p-16 text-center max-w-3xl mx-auto mt-12 ${isDark ? "bg-slate-900/50 border-2 border-dashed border-slate-700" : "bg-gray-50 border-2 border-dashed border-gray-300"}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>
            <BarChart2 className="w-10 h-10" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Sua biblioteca está vazia!
          </h2>
          <p className={`mb-8 max-w-md mx-auto ${isDark ? "text-slate-400" : "text-gray-500"}`}>
            Comece criando o seu primeiro painel de Inteligência de Negócios
            importando sua planilha Excel (.xlsx), CSV ou Conectando no Banco.
          </p>
          <Link
            href="/dashboard/upload"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Importar Dados Agora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {datasets.map((ds) => (
            <DashboardCard
              key={ds.id}
              id={ds.id}
              name={ds.name}
              status={ds.status || "processing"}
              date={new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
              }).format(new Date(ds.created_at))}
              onSuccess={() => setDatasets((prev) => prev.filter((d) => d.id !== ds.id))}
            />
          ))}

          {/* Action Card */}
          <Link
            href="/dashboard/upload"
            className={`group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] transition-all cursor-pointer text-center ${isDark ? "border-slate-700 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-300" : "border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600"}`}
          >
            <PlusCircle className={`w-10 h-10 mb-3 transition-colors ${isDark ? "text-slate-600 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-500"}`} />
            <h3 className="font-semibold mb-1">Criar Novo Painel</h3>
            <p className="text-sm">Importar Arquivo ou DB</p>
          </Link>
        </div>
      )}
    </div>
  );
}
