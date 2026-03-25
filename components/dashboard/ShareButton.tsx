"use client";
import { useState, useEffect } from "react";
import {
  Share2,
  Check,
  Loader2,
  Settings,
  Eye,
  Lock,
  Calendar,
  X,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  getOrCreateShareToken,
  updateShareSettings,
  getShareSettings,
} from "@/app/actions/share";
import { useToast } from "@/components/ToastProvider";

type Props = { dashboardId: string };

export function ShareButton({ dashboardId }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number | null>(null);

  // Form state
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [useExpiry, setUseExpiry] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await getShareSettings(dashboardId);
      if (settings.token) {
        setShareUrl(`${window.location.origin}/share/${settings.token}`);
      }
      if (settings.viewCount !== undefined) setViewCount(settings.viewCount);
      if (settings.password) {
        setUsePassword(true);
        setPassword(settings.password);
      }
      if (settings.expiresAt) {
        setUseExpiry(true);
        setExpiresAt(settings.expiresAt.substring(0, 10));
      }
    } catch {
      /* ignora se não há token ainda */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadSettings();
  }, [open]);

  const handleGetLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return;
    }
    try {
      setLoading(true);
      const token = await getOrCreateShareToken(dashboardId);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e: any) {
      toast("error", "Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const url = await updateShareSettings(dashboardId, {
        password: usePassword ? password : "",
        expiresAt: useExpiry
          ? new Date(expiresAt + "T23:59:59Z").toISOString()
          : null,
      });
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e: any) {
      toast("error", "Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
      >
        <Share2 className="h-3.5 w-3.5" />
        Compartilhar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="animate-in zoom-in-95 relative z-10 mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Share2 className="h-5 w-5 text-white" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Compartilhar Dashboard
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Configure o acesso público
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Stats - view count */}
              {viewCount !== null && viewCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-indigo-700">
                    {viewCount.toLocaleString("pt-BR")} visualizações
                  </span>
                </div>
              )}

              {/* Link */}
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wide text-gray-600 uppercase">
                  Link público
                </label>
                {shareUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600">
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleGetLink}
                      title="Copiar link"
                      className="flex-shrink-0 rounded-lg bg-indigo-50 p-2 text-indigo-600 transition-colors hover:bg-indigo-100"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleGetLink}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                    Gerar link público
                  </button>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use-password"
                    checked={usePassword}
                    onChange={(e) => setUsePassword(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <label
                    htmlFor="use-password"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                  >
                    <Lock className="h-3.5 w-3.5 text-gray-500" /> Proteger com
                    senha
                  </label>
                </div>
                {usePassword && (
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha de acesso..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                )}
              </div>

              {/* Expiração */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use-expiry"
                    checked={useExpiry}
                    onChange={(e) => setUseExpiry(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <label
                    htmlFor="use-expiry"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
                  >
                    <Calendar className="h-3.5 w-3.5 text-gray-500" /> Expirar
                    link em
                  </label>
                </div>
                {useExpiry && (
                  <input
                    type="date"
                    value={expiresAt}
                    min={new Date().toISOString().substring(0, 10)}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  />
                )}
              </div>

              {/* Salvar */}
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                {saving ? "Salvando..." : "Salvar e copiar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
