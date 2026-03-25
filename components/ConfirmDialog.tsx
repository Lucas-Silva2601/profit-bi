"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
};

type ConfirmContextType = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({ open: false, options: null, resolve: null });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    state.resolve?.(result);
    setState({ open: false, options: null, resolve: null });
  }, [state.resolve]);

  const { open, options } = state;
  const variant = options?.variant ?? "danger";

  const variantStyles = {
    danger: {
      icon: "text-red-400",
      iconBg: "bg-red-500/10",
      confirmBg: "bg-red-600 hover:bg-red-500",
      border: "border-red-500/20",
    },
    warning: {
      icon: "text-amber-400",
      iconBg: "bg-amber-500/10",
      confirmBg: "bg-amber-600 hover:bg-amber-500",
      border: "border-amber-500/20",
    },
    info: {
      icon: "text-indigo-400",
      iconBg: "bg-indigo-500/10",
      confirmBg: "bg-indigo-600 hover:bg-indigo-500",
      border: "border-indigo-500/20",
    },
  };

  const style = variantStyles[variant];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {open && options && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => handleClose(false)}
          />

          {/* Dialog */}
          <div
            className={`relative w-full max-w-md animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-200 rounded-2xl border ${style.border} bg-slate-900 shadow-2xl`}
            role="dialog"
            aria-modal="true"
          >
            {/* Close button */}
            <button
              onClick={() => handleClose(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${style.iconBg}`}>
                <AlertTriangle className={`h-7 w-7 ${style.icon}`} />
              </div>

              {/* Title */}
              {options.title && (
                <h3 className="mb-2 text-center text-lg font-bold text-white">
                  {options.title}
                </h3>
              )}

              {/* Message */}
              <p className="text-center text-sm leading-relaxed text-slate-400">
                {options.message}
              </p>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  {options.cancelLabel ?? "Cancelar"}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${style.confirmBg}`}
                >
                  {options.confirmLabel ?? "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
