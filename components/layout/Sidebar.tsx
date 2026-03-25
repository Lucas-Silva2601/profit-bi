"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import logo from "@/assets/logo/logo.png";
import logoIcon from "@/assets/logo/logo-p.png";

type SidebarProps = {
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
  widthClass?: string;
};

export function Sidebar({
  isCollapsed = false,
  toggleSidebar,
  widthClass = "w-64",
}: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const menuItems = [
    { icon: LayoutDashboard, label: "Meus Painéis", href: "/dashboard" },
    { icon: UploadCloud, label: "Importar Dados", href: "/dashboard/upload" },
    { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  ];

  return (
    <aside
      className={`${widthClass} border-r flex flex-col h-screen fixed transition-all duration-300 z-50 ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
    >
      <div className={`flex items-center justify-between p-4 border-b h-20 relative ${isDark ? "border-slate-800" : "border-gray-200"}`}>
        {!isCollapsed ? (
          <Link
            href="/dashboard"
            className="hover:opacity-80 transition-opacity flex items-center justify-start h-full w-full left-0 px-2"
          >
            <img
              src={logo.src}
              alt="Logo do Sistema"
              className="w-full h-auto max-w-[300px] max-h-90 object-contain drop-shadow-sm object-left"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="sr-only">Logo do Painel</span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="hover:opacity-80 transition-opacity mx-auto flex items-center justify-center"
          >
            <img
              src={logoIcon.src}
              alt="Logo Ícone"
              className="h-10 w-10 object-contain flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Link>
        )}
        {toggleSidebar && (
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
            className={`p-1.5 rounded-full transition-colors absolute -right-3 top-6 border shadow-md ${isDark ? "text-slate-400 hover:text-white hover:bg-slate-700 bg-slate-800 border-slate-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 bg-white border-gray-200"}`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" ||
                pathname.startsWith("/dashboard/bi/")
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-indigo-300 font-medium border border-indigo-500/30 shadow-sm"
                  : isDark
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <item.icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-indigo-400" : ""}`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
