"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── Conversões de cor ───────────────────────────────────────────────────────
type RGB = [number, number, number];
type HSB = [number, number, number]; // H:0-360, S:0-100, B:0-100

function hsbToRgb(h: number, s: number, b: number): RGB {
  s /= 100; b /= 100;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = b * (1 - s), q = b * (1 - f * s), t = b * (1 - (1 - f) * s);
  const m: RGB[] = [[b,t,p],[q,b,p],[p,b,t],[p,q,b],[t,p,b],[b,p,q]];
  return m[i].map(v => Math.round(v * 255)) as RGB;
}

function rgbToHsb(r: number, g: number, b: number): HSB {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return [Math.round(h) % 360, max > 0 ? Math.round((d / max) * 100) : 0, Math.round(max * 100)];
}

function hexToRgb(hex: string): RGB | null {
  const c = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(c)) return null;
  const n = parseInt(c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function ensureHash(hex: string) { return hex.startsWith("#") ? hex : "#" + hex; }

// ─── Presets de histórico inicial ───────────────────────────────────────────
const PRESETS = [
  "#EF4444","#F97316","#EAB308","#22C55E","#06B6D4","#3B82F6","#8B5CF6","#EC4899",
  "#111827","#374151","#6B7280","#D1D5DB","#ffffff","#F9FAFB",
];

// ─── Componente ──────────────────────────────────────────────────────────────
type Props = {
  value: string;
  onChange: (hex: string) => void;
  align?: "left" | "right";
};

export function ColorPickerPopup({ value, onChange, align = "left" }: Props) {
  const normVal = ensureHash(value);

  const getHsb = (hex: string): HSB => {
    const rgb = hexToRgb(hex);
    return rgb ? rgbToHsb(...rgb) : [220, 74, 90];
  };

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hue, setHue] = useState(() => getHsb(normVal)[0]);
  const [sat, setSat] = useState(() => getHsb(normVal)[1]);
  const [bri, setBri] = useState(() => getHsb(normVal)[2]);
  const [hexInput, setHexInput] = useState(normVal.replace("#", ""));
  const [prevColor, setPrevColor] = useState(normVal);
  const [history, setHistory] = useState<string[]>(PRESETS);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef   = useRef<HTMLDivElement>(null);
  const gradRef    = useRef<HTMLDivElement>(null);
  const hueRef     = useRef<HTMLDivElement>(null);
  const draggingGrad = useRef(false);
  const draggingHue  = useRef(false);

  useEffect(() => setMounted(true), []);

  // Derivados
  const [curR, curG, curB] = hsbToRgb(hue, sat, bri);
  const currentHex = rgbToHex(curR, curG, curB);

  useEffect(() => { setHexInput(currentHex); }, [currentHex]);

  // Abrir popup
  const handleOpen = () => {
    const hsb = getHsb(normVal);
    setHue(hsb[0]); setSat(hsb[1]); setBri(hsb[2]);
    setHexInput(normVal.replace("#", ""));
    setPrevColor(normVal);

    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const w = 460;
      const left = align === "right"
        ? Math.max(8, rect.right - w)
        : Math.min(rect.left, window.innerWidth - w - 8);
      setPopupPos({ top: rect.bottom + window.scrollY + 8, left: left + window.scrollX });
    }
    setOpen(v => !v);
  };

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        !popupRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Drag: gradiente
  const updateGrad = useCallback((cx: number, cy: number) => {
    const rect = gradRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSat(Math.round(Math.max(0, Math.min(1, (cx - rect.left) / rect.width)) * 100));
    setBri(Math.round((1 - Math.max(0, Math.min(1, (cy - rect.top) / rect.height))) * 100));
  }, []);

  // Drag: matiz
  const updateHue = useCallback((cy: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHue(Math.round(Math.max(0, Math.min(1, (cy - rect.top) / rect.height)) * 359));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingGrad.current) updateGrad(e.clientX, e.clientY);
      if (draggingHue.current)  updateHue(e.clientY);
    };
    const onUp = () => { draggingGrad.current = false; draggingHue.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [updateGrad, updateHue]);

  // Inputs
  const applyHex = (raw: string) => {
    setHexInput(raw.slice(0, 6));
    const rgb = hexToRgb(raw);
    if (rgb) {
      const [h, s, b] = rgbToHsb(...rgb);
      if (s > 0 || b === 0) setHue(h);
      setSat(s); setBri(b);
    }
  };

  const applyRgb = (r: number, g: number, b: number) => {
    const [h, s, bv] = rgbToHsb(
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b))
    );
    if (s > 0 || bv === 0) setHue(h);
    setSat(s); setBri(bv);
  };

  const handleOk = () => {
    const hex = "#" + currentHex;
    onChange(hex);
    setHistory(prev => [hex, ...prev.filter(h => h !== hex)].slice(0, 14));
    setOpen(false);
  };

  const numInput = (val: number, set: (n: number) => void, max = 255) => (
    <input
      type="number" value={val} min={0} max={max}
      onChange={e => set(Number(e.target.value))}
      className="w-14 border border-gray-300 rounded px-1 py-0.5 text-[11px] text-right bg-white focus:outline-none focus:border-indigo-400"
    />
  );

  const popupContent = (
    <div
      ref={popupRef}
      style={{ position: "absolute", top: popupPos.top, left: popupPos.left, zIndex: 9999, width: 460 }}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 select-none"
      onMouseDown={e => e.preventDefault()}
    >
      <div className="flex gap-3">
        {/* Gradiente de saturação/brilho */}
        <div
          ref={gradRef}
          className="relative rounded-lg overflow-hidden flex-shrink-0 cursor-crosshair"
          style={{
            width: 200, height: 200,
            background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, transparent), hsl(${hue}, 100%, 50%)`,
          }}
          onMouseDown={e => { draggingGrad.current = true; updateGrad(e.clientX, e.clientY); }}
        >
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 14, height: 14,
              left: `${sat}%`, top: `${100 - bri}%`,
              transform: "translate(-50%, -50%)",
              border: "2px solid white",
              boxShadow: "0 0 0 1.5px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* Slider de matiz */}
        <div className="flex flex-col items-center gap-2">
          <div
            ref={hueRef}
            className="relative rounded cursor-ns-resize"
            style={{
              width: 18, height: 200,
              background: "linear-gradient(to bottom,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
            }}
            onMouseDown={e => { draggingHue.current = true; updateHue(e.clientY); }}
          >
            <div
              className="absolute left-0 right-0 pointer-events-none rounded"
              style={{
                height: 4, top: `${(hue / 360) * 100}%`,
                transform: "translateY(-50%)",
                background: "white",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        </div>

        {/* Preview novo / atual */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-[10px] text-gray-400">novo</span>
          <div className="w-14 h-[88px] rounded-t border border-gray-200" style={{ backgroundColor: "#" + currentHex }} />
          <div className="w-14 h-[88px] rounded-b border border-gray-200" style={{ backgroundColor: prevColor }} />
          <span className="text-[10px] text-gray-400">atual</span>
        </div>

        {/* Inputs + Botões + Histórico */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col gap-1">
            <button onClick={handleOk} className="w-full py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors">OK</button>
            <button onClick={() => setOpen(false)} className="w-full py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors">Cancelar</button>
          </div>

          {/* HSB */}
          <div className="space-y-0.5">
            {[
              { lbl: "H:", v: hue, u: "°", fn: (n: number) => setHue(Math.max(0, Math.min(360, n))), mx: 360 },
              { lbl: "S:", v: sat, u: "%", fn: (n: number) => setSat(Math.max(0, Math.min(100, n))), mx: 100 },
              { lbl: "B:", v: bri, u: "%", fn: (n: number) => setBri(Math.max(0, Math.min(100, n))), mx: 100 },
            ].map(({ lbl, v, u, fn, mx }) => (
              <div key={lbl} className="flex items-center gap-1">
                <span className="text-[11px] text-gray-500 w-5">{lbl}</span>
                {numInput(v, fn, mx)}
                <span className="text-[10px] text-gray-400">{u}</span>
              </div>
            ))}
          </div>

          {/* RGB */}
          <div className="border-t border-gray-100 pt-1 space-y-0.5">
            {[
              { lbl: "R:", v: curR, fn: (n: number) => applyRgb(n, curG, curB) },
              { lbl: "G:", v: curG, fn: (n: number) => applyRgb(curR, n, curB) },
              { lbl: "B:", v: curB, fn: (n: number) => applyRgb(curR, curG, n) },
            ].map(({ lbl, v, fn }) => (
              <div key={lbl} className="flex items-center gap-1">
                <span className="text-[11px] text-gray-500 w-5">{lbl}</span>
                {numInput(v, fn, 255)}
              </div>
            ))}
          </div>

          {/* Histórico */}
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Histórico de cores:</p>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-sm border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: history[i] ?? "#f3f4f6" }}
                  onClick={() => { if (history[i]) applyHex(history[i].replace("#", "")); }}
                  title={history[i]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hex + info */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-mono">#:</span>
        <input
          type="text" value={hexInput} maxLength={6}
          onChange={e => applyHex(e.target.value)}
          className="w-24 border border-gray-300 rounded px-2 py-0.5 text-xs font-mono uppercase bg-white focus:outline-none focus:border-indigo-400"
          placeholder="4F46E5"
        />
        <span className="text-xs text-gray-400 font-mono ml-2">rgb({curR}, {curG}, {curB})</span>
        <span className="text-xs text-gray-400 font-mono">hsl({hue}, {sat}%, {Math.round(bri / 2)}%)</span>
      </div>
    </div>
  );

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        onClick={handleOpen}
        className="w-10 h-10 rounded-lg border-2 border-white shadow-md ring-2 ring-gray-200 cursor-pointer hover:scale-105 transition-transform"
        style={{ backgroundColor: normVal }}
        title="Clique para escolher a cor"
      />
      {open && mounted && createPortal(popupContent, document.body)}
    </div>
  );
}
