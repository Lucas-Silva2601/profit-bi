"use client";
import { useState, useMemo } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  data: Record<string, any>[];
  datasetName: string;
  onClose: () => void;
};

const ROWS_PER_PAGE = 50;

export function DataTableDrawer({ data, datasetName, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const columns = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => String(v ?? "").toLowerCase().includes(term))
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE) || 1;
  const pageData = filtered.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 bg-white w-full max-w-5xl flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Exploração de Dados</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {datasetName} — <span className="font-semibold text-indigo-600">{filtered.length.toLocaleString("pt-BR")}</span> registros
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Buscar em todos os campos..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Nenhum registro encontrado.</div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="text-left px-3 py-2.5 font-semibold text-gray-600 whitespace-nowrap border-r border-gray-100 last:border-r-0">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/30 transition-colors`}>
                    {columns.map(col => (
                      <td key={col} className="px-3 py-1.5 text-gray-700 max-w-[180px] truncate border-r border-gray-100/50 last:border-r-0" title={String(row[col] ?? "")}>
                        {String(row[col] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <span className="text-xs text-gray-500">
            {filtered.length > 0
              ? `Linhas ${page * ROWS_PER_PAGE + 1}–${Math.min((page + 1) * ROWS_PER_PAGE, filtered.length)} de ${filtered.length.toLocaleString("pt-BR")}`
              : "0 registros"}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-gray-600 min-w-[60px] text-center">
              {page + 1} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 text-gray-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
