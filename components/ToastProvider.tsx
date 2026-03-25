"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (m) => addToast("success", m),
        error: (m) => addToast("error", m),
        warning: (m) => addToast("warning", m),
        info: (m) => addToast("info", m),
      }}
    >
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] w-full max-w-sm space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-right fade-in pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg duration-300"
            style={{
              borderColor:
                toast.type === "success"
                  ? "#d1fae5"
                  : toast.type === "error"
                    ? "#fee2e2"
                    : toast.type === "warning"
                      ? "#fef3c7"
                      : "#e0e7ff",
            }}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              )}
              {toast.type === "error" && (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {toast.type === "warning" && (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              )}
              {toast.type === "info" && (
                <Info className="h-5 w-5 text-indigo-600" />
              )}
            </div>
            <p className="flex-1 text-sm text-gray-700">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-gray-600"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
