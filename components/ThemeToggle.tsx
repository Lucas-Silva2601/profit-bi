"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-7 w-12 items-center rounded-full bg-slate-700 border border-slate-600 transition-colors hover:bg-slate-600"
      aria-label="Alternar tema"
    >
      <div
        className={`absolute top-0.5 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          theme === "dark"
            ? "left-0.5 bg-slate-900"
            : "left-[22px] bg-amber-400"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="h-3.5 w-3.5 text-indigo-400" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-700" />
        )}
      </div>
    </button>
  );
}
