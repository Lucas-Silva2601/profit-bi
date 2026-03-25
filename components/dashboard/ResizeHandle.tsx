"use client";
import { useRef, useCallback, useEffect } from "react";

type ResizeHandleProps = {
  onResize: (width: number, height: number) => void;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  currentWidth?: number;
  currentHeight?: number;
};

export function ResizeHandle({
  onResize,
  minWidth = 200,
  maxWidth = 1200,
  minHeight = 120,
  maxHeight = 800,
  currentWidth,
  currentHeight,
}: ResizeHandleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<{ type: "width" | "height" | "both" } | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "width" | "height" | "both") => {
      e.preventDefault();
      e.stopPropagation();
      isResizing.current = { type };
      startPos.current = { x: e.clientX, y: e.clientY };

      const el = containerRef.current?.parentElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        startSize.current = { w: rect.width, h: rect.height };
      }

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing.current) return;
        const dx = moveEvent.clientX - startPos.current.x;
        const dy = moveEvent.clientY - startPos.current.y;

        let newW = startSize.current.w;
        let newH = startSize.current.h;

        if (type === "width" || type === "both") {
          newW = Math.max(minWidth, Math.min(maxWidth, startSize.current.w + dx));
        }
        if (type === "height" || type === "both") {
          newH = Math.max(minHeight, Math.min(maxHeight, startSize.current.h + dy));
        }

        onResize(Math.round(newW), Math.round(newH));
      };

      const onMouseUp = () => {
        isResizing.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor =
        type === "width" ? "ew-resize" : type === "height" ? "ns-resize" : "nwse-resize";
      document.body.style.userSelect = "none";
    },
    [onResize, minWidth, maxWidth, minHeight, maxHeight],
  );

  useEffect(() => {
    return () => {
      isResizing.current = null;
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-10">
      {/* Right edge - width resize */}
      <div
        className="pointer-events-auto absolute top-0 right-0 w-1.5 h-full cursor-ew-resize group/resize"
        onMouseDown={(e) => handleMouseDown(e, "width")}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-1 h-8 rounded-full bg-indigo-500/0 group-hover/resize:bg-indigo-500/40 transition-colors" />
      </div>

      {/* Bottom edge - height resize */}
      <div
        className="pointer-events-auto absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize group/resize"
        onMouseDown={(e) => handleMouseDown(e, "height")}
      >
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 h-1 w-8 rounded-full bg-indigo-500/0 group-hover/resize:bg-indigo-500/40 transition-colors" />
      </div>

      {/* Bottom-right corner - both resize */}
      <div
        className="pointer-events-auto absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize group/resize"
        onMouseDown={(e) => handleMouseDown(e, "both")}
      >
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-indigo-500/0 group-hover/resize:border-indigo-500/60 transition-colors rounded-br-sm" />
      </div>

      {/* Size indicator */}
      {currentWidth && currentHeight && (
        <div className="absolute bottom-1 right-6 pointer-events-none opacity-0 group-hover/resize:opacity-100 transition-opacity">
          <span className="text-[9px] font-mono font-bold text-indigo-400/60 bg-slate-900/80 px-1.5 py-0.5 rounded">
            {currentWidth}×{currentHeight}
          </span>
        </div>
      )}
    </div>
  );
}
