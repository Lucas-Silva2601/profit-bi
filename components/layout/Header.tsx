"use client";
import { Search, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export function Header() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [userName, setUserName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetch("/api/profile/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setUserName(data.name || data.email?.split("@")[0] || "Usuário");
        setWorkspaceName(data.workspaceName || "Workspace");
        setAvatarUrl(data.hasAvatar ? `/api/profile/avatar?v=${Date.now()}` : "");
      })
      .catch(() => {
        // Silencia erros de rede
      });
  }, []);

  return (
    <header className={`sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b px-8 backdrop-blur-sm transition-colors duration-300 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-gray-200 bg-white/80"}`}>
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-64">
          <Search className={`absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
          <input
            type="text"
            placeholder="Buscar painéis..."
            aria-label="Buscar painéis"
            className={`w-full rounded-lg border py-1.5 pr-4 pl-10 text-sm placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${isDark ? "border-slate-700 bg-slate-800 text-white" : "border-gray-300 bg-gray-100 text-gray-900"}`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <button
          className={`relative transition-colors ${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500"></span>
        </button>

        <div className={`flex cursor-pointer items-center gap-3 border-l pl-6 transition-colors ${isDark ? "border-slate-700" : "border-gray-200"}`}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className={`h-8 w-8 rounded-full object-cover border ${isDark ? "border-slate-600" : "border-gray-300"}`}
            />
          ) : (
            <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold border ${isDark ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-indigo-100 text-indigo-600 border-indigo-200"}`}>
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="text-sm">
            <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {userName || "Carregando..."}
            </p>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              {workspaceName || "Workspace"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
