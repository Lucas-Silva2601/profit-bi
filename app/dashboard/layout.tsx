"use client";
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem("profit-bi-sidebar");
    if (saved === "collapsed") setIsCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(
      "profit-bi-sidebar",
      newState ? "collapsed" : "expanded",
    );
  };

  const navWidth = !isHydrated ? "w-64" : isCollapsed ? "w-20" : "w-64";
  const mainMargin = !isHydrated ? "ml-64" : isCollapsed ? "ml-20" : "ml-64";

  const isDark = theme === "dark";

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Sidebar
        isCollapsed={isHydrated && isCollapsed}
        toggleSidebar={toggleSidebar}
        widthClass={navWidth}
      />
      <div
        className={`flex-1 flex flex-col ${mainMargin} overflow-hidden transition-all duration-300`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-8 relative">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <DashboardInner>{children}</DashboardInner>
    </ThemeProvider>
  );
}
