"use client";
import { useState, useEffect } from "react";
import {
  User,
  CreditCard,
  Shield,
  Settings2,
  Bell,
  LogOut,
  FileText,
  ChevronRight,
  Key,
  Monitor,
  Clock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Plus,
  Copy,
  XCircle,
  Smartphone,
  Globe,
  RefreshCw,
  Mail,
  Link2,
  Database,
  Upload,
  Sparkles,
  Share2,
  BarChart3,
  FileSpreadsheet,
  Receipt,
  Download,
  Upload as UploadIcon,
  Webhook,
  Terminal,
  Trash,
  AlertOctagon,
  Zap,
  HardDrive,
  ArrowDownUp,
  Languages,
  CalendarDays,
  DollarSign,
  Clock4,
  ExternalLink,
  Phone,
  Camera,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { authClient } from "@/utils/auth-client";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Toggle({
  enabled,
  onToggle,
  size = "md",
}: {
  enabled: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors ${size === "sm" ? "h-5 w-9" : "h-6 w-11"
        } ${enabled ? "bg-indigo-500" : "bg-gray-400"}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow-sm transition-transform ${size === "sm" ? "h-4 w-4" : "h-5 w-5"
          } ${enabled ? (size === "sm" ? "translate-x-4" : "translate-x-5") : "translate-x-0.5"}`}
      />
    </button>
  );
}

function NotifSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
          <Icon className={`h-5 w-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h2>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function NotifRow({
  label,
  desc,
  enabled,
  onToggle,
}: {
  label: string;
  desc?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
      <div>
        <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{label}</p>
        {desc && <p className={`mt-0.5 text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{desc}</p>}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("profile");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [userDateOfBirth, setUserDateOfBirth] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userGender, setUserGender] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [apiKeys, setApiKeys] = useState<
    {
      id: string;
      name: string;
      key: string;
      created: string;
      lastUsed: string;
    }[]
  >([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [sessions, setSessions] = useState<
    {
      id: string;
      device: string;
      ip: string;
      location: string;
      lastActive: string;
      current: boolean;
      icon: any;
    }[]
  >([]);
  const [loginHistory] = useState<
    {
      id: string;
      device: string;
      ip: string;
      location: string;
      date: string;
      status: string;
    }[]
  >([]);
  const [notifChannels, setNotifChannels] = useState({
    email: true,
    push: false,
    inApp: true,
  });
  const [notifData, setNotifData] = useState({
    uploadSuccess: true,
    uploadError: true,
    dbConnection: true,
  });
  const [notifAI, setNotifAI] = useState({
    dashboardReady: true,
    newInsights: true,
  });
  const [notifShared, setNotifShared] = useState({
    dashboardAccess: true,
    newWorkspaceAccess: true,
  });
  const [notifDigest, setNotifDigest] = useState({
    enabled: false,
    frequency: "weekly" as "daily" | "weekly" | "monthly",
  });
  const [notifBilling, setNotifBilling] = useState({
    invoiceGenerated: true,
    planChanges: true,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  const [regional, setRegional] = useState({
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    language: "pt-BR",
  });
  const [webhooks, setWebhooks] = useState<
    { id: string; url: string; events: string[]; active: boolean }[]
  >([]);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: "",
    events: [] as string[],
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [cacheSize, setCacheSize] = useState("24.5 MB");
  const [devMode, setDevMode] = useState(false);
  const [apiLogs] = useState<
    {
      id: string;
      method: string;
      path: string;
      status: number;
      time: string;
      date: string;
    }[]
  >([]);

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    setNotifSaved(false);
    await new Promise((r) => setTimeout(r, 800));
    setSavingNotifs(false);
    setNotifSaved(true);
    toast("success", "Preferências de notificação salvas com sucesso!");
    setTimeout(() => setNotifSaved(false), 3000);
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const res = await fetch("/api/profile/me");
        if (!res.ok) return;
        const data = await res.json();
        setUserEmail(data.email || "usuario@empresa.com");
        setUserName(data.name || "");
        setUserDateOfBirth(data.dateOfBirth || "");
        setUserPhone(data.phone || "");
        setUserGender(data.gender || "");
        setAvatarUrl(data.hasAvatar ? `/api/profile/avatar?v=${Date.now()}` : "");
        setEmailVerified(!!data.emailVerified);
      } catch {
        // Silencia erros de rede
      }
    };
    loadUserProfile();
  }, []);

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split("/")[1];
    if (!["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) {
      toast("error", "Formato inválido. Use JPG, PNG, GIF ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("error", "A imagem deve ter no máximo 5MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha no upload");

      setAvatarUrl(`/api/profile/avatar?v=${Date.now()}`);
      toast("success", "Foto de perfil atualizada!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast("error", "Erro ao fazer upload: " + (err.message || "tente novamente."));
    } finally {
      setUploadingPhoto(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingPhoto(true);
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha ao remover");

      setAvatarUrl("");
      toast("success", "Foto de perfil removida!");
    } catch (err: any) {
      console.error("Remove avatar error:", err);
      toast("error", "Erro ao remover: " + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    let cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
    if (cleaned.length > 7) {
      cleaned = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length > 2) {
      cleaned = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
    setUserPhone(cleaned);
  };

  const handleSaveProfile = async () => {
    const res = await fetch("/api/profile/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: userName,
        dateOfBirth: userDateOfBirth || null,
        phone: userPhone || null,
        gender: userGender || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast("error", "Erro ao salvar: " + (data.error || "tente novamente."));
    } else {
      toast("success", "Perfil atualizado com sucesso!");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "A nova senha deve ter pelo menos 8 caracteres.",
      });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      if (error) throw error;
      setPasswordMessage({
        type: "success",
        text: "Senha alterada com sucesso!",
      });
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err.message || "Erro ao alterar senha.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    try {
      // Requer um provedor de e-mail configurado (ex: Resend) no Better Auth
      setPasswordMessage({
        type: "success",
        text: "Reenvio de e-mail disponível após configurar um provedor de e-mail no servidor.",
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      const { data: sessionList, error } = await authClient.listSessions();
      if (error) throw error;

      const others = (sessionList ?? []).filter((s: any) => !s.isCurrent);
      for (const s of others) {
        if (s.token) {
          await authClient.revokeSession({ token: s.token });
        }
      }
      setPasswordMessage({
        type: "success",
        text: "Todas as outras sessões foram revogadas.",
      });
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err.message || "Erro ao revogar sessões.",
      });
    }
  };

  const handleGenerateApiKey = () => {
    const key = `pk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName || "Nova chave",
      key: `pk_live_••••••••••••••••${key.slice(-4)}`,
      created: new Date().toLocaleDateString("pt-BR"),
      lastUsed: "Nunca",
    };
    setApiKeys([...apiKeys, newKey]);
    setGeneratedKey(key);
    setNewKeyName("");
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setPasswordMessage({
      type: "success",
      text: "Chave copiada para a área de transferência!",
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const tabs = [
    { id: "profile", icon: User, label: "Meu Perfil" },
    { id: "billing", icon: CreditCard, label: "Plano e Cobrança" },
    { id: "security", icon: Shield, label: "Segurança" },
    { id: "notifications", icon: Bell, label: "Notificações" },
    { id: "legal", icon: FileText, label: "Termos e Políticas" },
    { id: "advanced", icon: Settings2, label: "Avançado" },
  ];

  return (
    <div className="animate-in fade-in mx-auto max-w-4xl space-y-8 pb-12 duration-500">
      <div>
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Configurações</h1>
        <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Gerencie a sua conta, preferências e assinatura do Profit BI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Menu lateral de configs */}
        <div className="col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${activeTab === tab.id
                ? isDark
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : isDark
                  ? "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="h-5 w-5" /> {tab.label}
              </div>
              {activeTab === tab.id && (
                <ChevronRight className="h-4 w-4 opacity-50" />
              )}
            </button>
          ))}

          <div className={`mt-2 border-t pt-4 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            <button
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 font-bold transition-colors ${isDark ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20" : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"}`}
            >
              <LogOut className="h-5 w-5" /> Sair da Conta
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div className="col-span-1 space-y-6 md:col-span-2">
          {/* TAB: MEU PERFIL */}
          {activeTab === "profile" && (
            <>
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 duration-200 ${isDark ? "border-white/10 bg-white/5 backdrop-blur-sm" : "border-gray-200 bg-white shadow-md"}`}>
                <h2 className={`mb-4 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Informações Pessoais
                </h2>

                <div className="space-y-6">
                  {/* Foto de Perfil */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full border-2 border-indigo-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100">
                          <User className="h-10 w-10 text-indigo-600" />
                        </div>
                      )}
                      {uploadingPhoto && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 text-center">
                        <Camera className="mr-2 inline h-4 w-4" />
                        {avatarUrl ? "Trocar foto" : "Adicionar foto"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAvatar}
                          className="hidden"
                          disabled={uploadingPhoto}
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          onClick={handleRemoveAvatar}
                          disabled={uploadingPhoto}
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          Remover foto
                        </button>
                      )}
                      <p className="text-xs text-gray-400">
                        JPG, PNG, GIF ou WebP. Máx. 5MB.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={`w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white placeholder-gray-500" : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className={`w-full cursor-not-allowed rounded-lg border px-4 py-2 text-sm outline-none ${isDark ? "border-white/10 bg-white/5 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-500"}`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      O e-mail não pode ser alterado pois é vinculado à sua
                      autenticação de login.
                    </p>
                  </div>

                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Data de Nascimento
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="date"
                        value={userDateOfBirth}
                        onChange={(e) => setUserDateOfBirth(e.target.value)}
                        className={`w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={`w-full rounded-lg border pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Gênero
                    </label>
                    <select
                      value={userGender}
                      onChange={(e) => setUserGender(e.target.value)}
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="">Selecione (opcional)</option>
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="non_binary">Não-binário</option>
                      <option value="other">Outro</option>
                      <option value="prefer_not_to_say">Prefiro não informar</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Plano Beta */}
              <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-indigo-800 bg-gradient-to-br from-indigo-900 to-indigo-700 p-6 text-white shadow-md duration-300">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="mb-1 text-xl font-bold">
                      Profit BI Pro{" "}
                      <span className="ml-2 rounded-full bg-indigo-500 px-2 py-1 text-xs">
                        Beta
                      </span>
                    </h2>
                    <p className="text-sm text-indigo-200">
                      Você está nos ajudando a testar a ferramenta.
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-indigo-400 opacity-50" />
                </div>

                <div className="mt-6 rounded-xl bg-white/10 p-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Acessos a Inteligência Artificial</span>
                    <span className="font-bold">Ilimitado</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/20">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setActiveTab("billing")}
                    className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-indigo-900 transition-colors hover:bg-gray-50"
                  >
                    Ver Assinatura
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB: TERMOS E POLÍTICAS */}
          {activeTab === "legal" && (
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 duration-200 ${isDark ? "border-white/10 bg-white/5 backdrop-blur-sm" : "border-gray-200 bg-white shadow-md"}`}>
                <h2 className={`mb-4 flex items-center gap-2 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                <FileText className="h-6 w-6 text-indigo-400" />
                Termos e Políticas
              </h2>
              <p className="mb-6 text-sm text-gray-400">
                Consulte nossos compromissos de segurança de dados, direitos do
                consumidor e políticas de utilização da plataforma e APIs.
              </p>

              <div className="space-y-4">
                <Link
                  href="/privacy"
                  className="group block w-full rounded-xl border border-white/10 p-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-200 group-hover:text-indigo-400">
                        Política de Privacidade
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Como armazenamos, protegemos e utilizamos seus dados de
                        painéis.
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" />
                  </div>
                </Link>

                <div className="group block w-full cursor-pointer rounded-xl border border-white/10 p-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-200 group-hover:text-indigo-400">
                        Termos de Uso
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Regras gerais corporativas e limites jurídicos do
                        licenciamento do software.
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" />
                  </div>
                </div>

                <div className="group block w-full cursor-pointer rounded-xl border border-white/10 p-4 transition-all hover:border-indigo-500/50 hover:bg-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-200 group-hover:text-indigo-400">
                        Políticas de Cookies
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Manejo de identificadores dentro dos navegadores para
                        login contínuo.
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANO E COBRANÇA */}
          {activeTab === "billing" && (
            <>
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 duration-200 ${isDark ? "border-white/10 bg-white/5 backdrop-blur-sm" : "border-gray-200 bg-white shadow-md"}`}>
                <h2 className={`mb-2 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Seu Plano Atual
                </h2>
                <p className={`mb-6 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Gerencie sua assinatura e forma de pagamento.
                </p>

                <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold">
                        ATIVO
                      </span>
                      <h3 className="mt-2 text-2xl font-bold">Profit BI Pro</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">R$ 35</p>
                      <p className="text-sm text-indigo-200">/mês</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-indigo-100">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Acessos ilimitados à Inteligência Artificial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Dashboards ilimitados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Upload de arquivos Excel e CSV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Suporte prioritário</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 duration-200 ${isDark ? "border-white/10 bg-white/5 backdrop-blur-sm" : "border-gray-200 bg-white shadow-md"}`}>
                <h2 className={`mb-2 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Forma de Pagamento
                </h2>
                <p className={`mb-6 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Cartão de crédito cadastrado para cobrança mensal.
                </p>

                <div className="space-y-4">
                  <div className={`flex items-center gap-3 rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                    <CreditCard className={`h-8 w-8 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                    <div className="flex-1">
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Cartão de Crédito
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Cobrança automática mensal
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                      Configurado
                    </span>
                  </div>

                  <div className={`rounded-xl border p-4 ${isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50"}`}>
                    <p className={`text-sm ${isDark ? "text-indigo-300" : "text-indigo-800"}`}>
                      <span className="font-semibold">Próxima cobrança:</span>{" "}
                      R$ 35,00 será cobrado automaticamente no seu cartão de
                      crédito a cada 30 dias.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button className={`text-sm font-medium transition-colors ${isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-800"}`}>
                      Alterar cartão de crédito
                    </button>
                  </div>
                </div>
              </div>

              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 duration-200 ${isDark ? "border-white/10 bg-white/5 backdrop-blur-sm" : "border-gray-200 bg-white shadow-md"}`}>
                <h2 className={`mb-4 text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Histórico de Pagamentos
                </h2>
                <div className={`py-8 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  <CreditCard className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">Nenhuma cobrança realizada ainda.</p>
                  <p className="mt-1 text-xs">
                    Seu histórico aparecerá aqui após o primeiro pagamento.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* TAB: SEGURANÇA */}
          {activeTab === "security" && (
            <>
              {/* Alterar Senha */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <KeyRound className={`h-5 w-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Alterar Senha
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Atualize sua senha de acesso à plataforma.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Senha Atual
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.current}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            current: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border px-4 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 right-3 -translate-y-1/2 ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.new}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            new: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border px-4 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute top-1/2 right-3 -translate-y-1/2 ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirm}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirm: e.target.value,
                          })
                        }
                        className={`w-full rounded-lg border px-4 py-2 pr-10 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                        placeholder="Repita a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className={`absolute top-1/2 right-3 -translate-y-1/2 ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordMessage && (
                    <div
                      className={`flex items-center gap-2 rounded-lg p-3 text-sm ${passwordMessage.type === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-700"}`}
                    >
                      {passwordMessage.type === "success" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {passwordMessage.text}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handlePasswordChange}
                      disabled={
                        passwordLoading ||
                        !passwordForm.new ||
                        !passwordForm.confirm
                      }
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {passwordLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Atualizar Senha
                    </button>
                  </div>
                </div>
              </div>

              {/* Verificação de E-mail */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <Mail className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Verificação de E-mail
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Status de confirmação do seu e-mail cadastrado.
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between rounded-xl border p-4 ${emailVerified ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}
                >
                  <div className="flex items-center gap-3">
                    {emailVerified ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <div>
                      <p
                        className={`font-semibold ${emailVerified ? "text-emerald-400" : "text-amber-400"}`}
                      >
                        {emailVerified
                          ? "E-mail verificado"
                          : "E-mail não verificado"}
                      </p>
                      <p
                        className={`text-sm ${emailVerified ? "text-emerald-400/70" : "text-amber-400/70"}`}
                      >
                        {emailVerified
                          ? "Seu e-mail foi confirmado com sucesso."
                          : "Confirme seu e-mail para garantir a segurança da conta."}
                      </p>
                    </div>
                  </div>
                  {!emailVerified && (
                    <button
                      onClick={handleResendVerification}
                      disabled={sendingVerification}
                      className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
                    >
                      {sendingVerification ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Reenviar
                    </button>
                  )}
                </div>
              </div>

              {/* Sessões Ativas */}
              <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm duration-200">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                      <Monitor className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Sessões Ativas
                      </h2>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Dispositivos conectados à sua conta.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRevokeOtherSessions}
                    className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Revogar outras
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between rounded-xl border p-4 ${session.current ? (isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50") : (isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50")}`}
                      >
                        <div className="flex items-center gap-3">
                          <session.icon
                            className={`h-5 w-5 ${session.current ? "text-indigo-600" : "text-gray-400"}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-200">
                                {session.device}
                              </p>
                              {session.current && (
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-400">
                                  Atual
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {session.location} · {session.lastActive}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <span className="text-xs text-gray-400">
                            {session.ip}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-gray-400">
                      <Monitor className="mx-auto mb-2 h-8 w-8 opacity-30" />
                      <p>Nenhuma sessão adicional detectada.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de Login */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <Clock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Histórico de Login
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Últimos acessos à sua conta.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {loginHistory.map((login) => (
                    <div
                      key={login.id}
                        className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div className="flex items-center gap-3">
                        {login.status === "success" ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-200">
                            {login.device}
                          </p>
                          <p className="text-xs text-gray-500">
                            {login.location} · {login.ip}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{login.date}</p>
                        <p
                          className={`text-xs ${login.status === "success" ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {login.status === "success" ? "Sucesso" : "Falha"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chaves de API */}
              <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm duration-200">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                      <Key className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Chaves de API
                      </h2>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Gerencie tokens para integração com sistemas externos.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewKeyModal(true);
                      setGeneratedKey("");
                    }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Chave
                  </button>
                </div>

                {apiKeys.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                      className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-indigo-500" />
                            <p className="font-semibold text-gray-200">
                              {apiKey.name}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center gap-3">
                            <code className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                              {apiKey.key}
                            </code>
                            <button
                              onClick={() => handleCopyKey(apiKey.key)}
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Criada em {apiKey.created} · Último uso:{" "}
                            {apiKey.lastUsed}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                          className="ml-4 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 py-8 text-center text-gray-400">
                    <Key className="mx-auto mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">Nenhuma chave de API gerada.</p>
                  </div>
                )}
              </div>

              {/* Modal Nova Chave */}
              {showNewKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        Gerar Nova Chave de API
                      </h3>
                      <button
                        onClick={() => setShowNewKeyModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>

                    {!generatedKey ? (
                      <div className="space-y-4">
                        <div>
                          <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                            Nome da Chave
                          </label>
                          <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white placeholder-gray-500" : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"}`}
                            placeholder="Ex: Integração com ERP"
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowNewKeyModal(false)}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${isDark ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleGenerateApiKey}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                          >
                            Gerar Chave
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <p className="text-sm font-semibold text-amber-300">
                              Copie sua chave agora!
                            </p>
                          </div>
                          <p className="text-xs text-amber-400/80">
                            Ela não será exibida novamente após fechar este
                            modal.
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 rounded-lg border p-3 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                          <code className={`flex-1 text-xs break-all ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            {generatedKey}
                          </code>
                          <button
                            onClick={() => handleCopyKey(generatedKey)}
                            className={`${isDark ? "text-gray-400 hover:text-indigo-400" : "text-gray-500 hover:text-indigo-600"}`}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => setShowNewKeyModal(false)}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                          >
                            Concluído
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: NOTIFICAÇÕES */}
          {activeTab === "notifications" && (
            <>
              {/* Canais de Notificação */}
              <NotifSection
                icon={Bell}
                title="Canais de Notificação"
                description="Escolha por onde deseja receber as notificações."
              >
                <div className="mt-2 space-y-3">
                  <NotifRow
                    label="E-mail"
                    desc="Receba notificações diretamente no seu e-mail cadastrado."
                    enabled={notifChannels.email}
                    onToggle={() =>
                      setNotifChannels({
                        ...notifChannels,
                        email: !notifChannels.email,
                      })
                    }
                  />
                  <NotifRow
                    label="Push no Navegador"
                    desc="Notificações em tempo real no seu navegador."
                    enabled={notifChannels.push}
                    onToggle={() =>
                      setNotifChannels({
                        ...notifChannels,
                        push: !notifChannels.push,
                      })
                    }
                  />
                  <NotifRow
                    label="In-App (Sino)"
                    desc="Notificações dentro da plataforma no ícone do sino."
                    enabled={notifChannels.inApp}
                    onToggle={() =>
                      setNotifChannels({
                        ...notifChannels,
                        inApp: !notifChannels.inApp,
                      })
                    }
                  />
                </div>
              </NotifSection>

              {/* Alertas de Dados */}
              <NotifSection
                icon={Database}
                title="Alertas de Dados"
                description="Notificações sobre uploads, processamento e conexões."
              >
                <div className="mt-2 space-y-3">
                  <NotifRow
                    label="Upload processado com sucesso"
                    desc="Quando um arquivo Excel/CSV for importado com sucesso."
                    enabled={notifData.uploadSuccess}
                    onToggle={() =>
                      setNotifData({
                        ...notifData,
                        uploadSuccess: !notifData.uploadSuccess,
                      })
                    }
                  />
                  <NotifRow
                    label="Erro no processamento"
                    desc="Quando houver falha ao processar um arquivo importado."
                    enabled={notifData.uploadError}
                    onToggle={() =>
                      setNotifData({
                        ...notifData,
                        uploadError: !notifData.uploadError,
                      })
                    }
                  />
                  <NotifRow
                    label="Falha ou restauração de conexão com banco"
                    desc="Quando a conexão com seu banco de dados cair ou for restabelecida."
                    enabled={notifData.dbConnection}
                    onToggle={() =>
                      setNotifData({
                        ...notifData,
                        dbConnection: !notifData.dbConnection,
                      })
                    }
                  />
                </div>
              </NotifSection>

              {/* Alertas de IA */}
              <NotifSection
                icon={Sparkles}
                title="Alertas de Inteligência Artificial"
                description="Notificações sobre dashboards e insights gerados pela IA."
              >
                <div className="mt-2 space-y-3">
                  <NotifRow
                    label="Dashboard gerado pela IA está pronto"
                    desc="Quando a IA finalizar a criação automática de um painel."
                    enabled={notifAI.dashboardReady}
                    onToggle={() =>
                      setNotifAI({
                        ...notifAI,
                        dashboardReady: !notifAI.dashboardReady,
                      })
                    }
                  />
                  <NotifRow
                    label="Novos insights detectados"
                    desc="Quando a IA identificar padrões ou anomalias nos seus dados."
                    enabled={notifAI.newInsights}
                    onToggle={() =>
                      setNotifAI({
                        ...notifAI,
                        newInsights: !notifAI.newInsights,
                      })
                    }
                  />
                </div>
              </NotifSection>

              {/* Atividade Compartilhada */}
              <NotifSection
                icon={Share2}
                title="Atividade Compartilhada"
                description="Notificações sobre compartilhamentos e acessos."
              >
                <div className="mt-2 space-y-3">
                  <NotifRow
                    label="Acesso a dashboard compartilhado"
                    desc="Quando alguém acessar um painel que você compartilhou."
                    enabled={notifShared.dashboardAccess}
                    onToggle={() =>
                      setNotifShared({
                        ...notifShared,
                        dashboardAccess: !notifShared.dashboardAccess,
                      })
                    }
                  />
                  <NotifRow
                    label="Novo acesso a workspace/painel"
                    desc="Quando receber acesso a um novo workspace ou painel."
                    enabled={notifShared.newWorkspaceAccess}
                    onToggle={() =>
                      setNotifShared({
                        ...notifShared,
                        newWorkspaceAccess: !notifShared.newWorkspaceAccess,
                      })
                    }
                  />
                </div>
              </NotifSection>

              {/* Resumo Periódico (Digest) */}
              <NotifSection
                icon={BarChart3}
                title="Resumo Periódico (Digest)"
                description="Receba um e-mail com métricas-chave dos seus painéis."
              >
                <div className="mt-2 space-y-4">
                  <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Ativar resumo por e-mail
                      </p>
                      <p className={`mt-0.5 text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                        Enviamos um relatório com as principais métricas dos
                        seus dashboards.
                      </p>
                    </div>
                    <Toggle
                      enabled={notifDigest.enabled}
                      onToggle={() =>
                        setNotifDigest({
                          ...notifDigest,
                          enabled: !notifDigest.enabled,
                        })
                      }
                    />
                  </div>

                  {notifDigest.enabled && (
                    <div className={`rounded-xl border p-4 ${isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-100 bg-indigo-50/50"}`}>
                      <p className={`mb-3 text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Frequência do resumo
                      </p>
                      <div className="flex gap-3">
                        {[
                          { value: "daily" as const, label: "Diário" },
                          { value: "weekly" as const, label: "Semanal" },
                          { value: "monthly" as const, label: "Mensal" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() =>
                              setNotifDigest({
                                ...notifDigest,
                                frequency: opt.value,
                              })
                            }
                            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${notifDigest.frequency === opt.value
                              ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                              : isDark
                                ? "border-white/10 bg-white/5 text-gray-400 hover:border-indigo-500/50"
                                : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200"
                              }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </NotifSection>

              {/* Cobrança e Conta */}
              <NotifSection
                icon={Receipt}
                title="Cobrança e Conta"
                description="Notificações sobre faturas, plano e alterações na conta."
              >
                <div className="mt-2 space-y-3">
                  <NotifRow
                    label="Fatura gerada ou paga"
                    desc="Receba confirmação quando uma fatura for gerada ou quitada."
                    enabled={notifBilling.invoiceGenerated}
                    onToggle={() =>
                      setNotifBilling({
                        ...notifBilling,
                        invoiceGenerated: !notifBilling.invoiceGenerated,
                      })
                    }
                  />
                  <NotifRow
                    label="Alterações no plano ou na conta"
                    desc="Quando houver mudanças no seu plano ou dados da conta."
                    enabled={notifBilling.planChanges}
                    onToggle={() =>
                      setNotifBilling({
                        ...notifBilling,
                        planChanges: !notifBilling.planChanges,
                      })
                    }
                  />
                </div>
              </NotifSection>

              {/* Botão Salvar */}
              <div className={`flex items-center justify-between rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div>
                  <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    Salvar preferências
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Suas configurações de notificação serão aplicadas
                    imediatamente.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {notifSaved && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      Salvo!
                    </span>
                  )}
                  <button
                    onClick={handleSaveNotifications}
                    disabled={savingNotifs}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {savingNotifs && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Salvar Preferências
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB: AVANÇADO */}
          {activeTab === "advanced" && (
            <>
              {/* Preferências Regionais */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <Globe className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Preferências Regionais
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Configurações de idioma, data, moeda e fuso horário.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1 flex items-center gap-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <Languages className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} /> Idioma
                    </label>
                    <select
                      value={regional.language}
                      onChange={(e) =>
                        setRegional({ ...regional, language: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="pt-BR">Português (BR)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className={`mb-1 flex items-center gap-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <CalendarDays className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} /> Formato
                      de Data
                    </label>
                    <select
                      value={regional.dateFormat}
                      onChange={(e) =>
                        setRegional({ ...regional, dateFormat: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className={`mb-1 flex items-center gap-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <DollarSign className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} /> Moeda
                      Padrão
                    </label>
                    <select
                      value={regional.currency}
                      onChange={(e) =>
                        setRegional({ ...regional, currency: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="BRL">Real Brasileiro (R$)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`mb-1 flex items-center gap-2 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <Clock4 className={`h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} /> Fuso Horário
                    </label>
                    <select
                      value={regional.timezone}
                      onChange={(e) =>
                        setRegional({ ...regional, timezone: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <DollarSign className="h-4 w-4 text-gray-500" /> Moeda
                      Padrão
                    </label>
                    <select
                      value={regional.currency}
                      onChange={(e) =>
                        setRegional({ ...regional, currency: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="BRL">Real Brasileiro (R$)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Clock4 className="h-4 w-4 text-gray-500" /> Fuso Horário
                    </label>
                    <select
                      value={regional.timezone}
                      onChange={(e) =>
                        setRegional({ ...regional, timezone: e.target.value })
                      }
                      className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-gray-300 bg-white text-gray-900"}`}
                    >
                      <option value="America/Sao_Paulo">
                        Brasília (GMT-3)
                      </option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                      <option value="America/Noronha">
                        Fernando de Noronha (GMT-2)
                      </option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Webhooks */}
              <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm duration-200">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                      <Webhook className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Webhooks
                      </h2>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        URLs para receber eventos em tempo real.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowWebhookModal(true);
                      setNewWebhook({ url: "", events: [] });
                    }}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Webhook
                  </button>
                </div>

                {webhooks.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {webhooks.map((wh) => (
                      <div
                        key={wh.id}
                        className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                            <code className="text-sm text-gray-300">
                              {wh.url}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${wh.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-500"}`}
                            >
                              {wh.active ? "Ativo" : "Inativo"}
                            </span>
                            <button
                              onClick={() =>
                                setWebhooks(
                                  webhooks.map((w) =>
                                    w.id === wh.id
                                      ? { ...w, active: !w.active }
                                      : w
                                  )
                                )
                              }
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <Zap className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                setWebhooks(
                                  webhooks.filter((w) => w.id !== wh.id)
                                )
                              }
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {wh.events.map((ev) => (
                            <span
                              key={ev}
                              className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-400"
                            >
                              {ev.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 py-8 text-center text-gray-400">
                    <Webhook className="mx-auto mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">Nenhum webhook configurado.</p>
                  </div>
                )}
              </div>

              {/* Exportar / Importar Dados */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <ArrowDownUp className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Exportar / Importar Dados
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Exporte seus dados para backup ou importe configurações.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <Download className={`h-5 w-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                      <h3 className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Exportar Dados
                      </h3>
                    </div>
                    <p className={`mb-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Baixe todos os seus dados em formato JSON (conforme LGPD).
                    </p>
                    <button
                      onClick={() => setShowExportModal(true)}
                      className={`w-full rounded-lg border py-2 text-sm font-medium transition-colors ${isDark ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}
                    >
                      Solicitar Exportação
                    </button>
                  </div>
                  <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50"}`}>
                    <div className="mb-3 flex items-center gap-2">
                      <UploadIcon className={`h-5 w-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                      <h3 className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Importar Backup
                      </h3>
                    </div>
                    <p className={`mb-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Restaure configurações a partir de um arquivo de backup
                      JSON.
                    </p>
                    <button className={`w-full rounded-lg border py-2 text-sm font-medium transition-colors ${isDark ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20" : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}>
                      Selecionar Arquivo
                    </button>
                  </div>
                </div>
              </div>

              {/* Cache e Performance */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 backdrop-blur-sm duration-200 ${isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}`}>
                    <HardDrive className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Cache e Performance
                    </h2>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Gerencie o cache local e o refresh automático.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Cache local armazenado
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {cacheSize} em dados temporários
                      </p>
                    </div>
                    <button
                      onClick={() => setCacheSize("0 MB")}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      <Trash className="h-4 w-4" />
                      Limpar Cache
                    </button>
                  </div>
                  <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50/50"}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Auto-refresh dos dados
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Atualizar dashboards automaticamente a cada 5 minutos.
                      </p>
                    </div>
                    <Toggle enabled={true} onToggle={() => { }} />
                  </div>
                </div>
              </div>

              {/* Modo Desenvolvedor */}
              <div className="animate-in fade-in zoom-in-95 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm duration-200">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20">
                      <Terminal className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        Modo Desenvolvedor
                      </h2>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Logs de API, debug mode e IDs internos.
                      </p>
                    </div>
                  </div>
                  <Toggle
                    enabled={devMode}
                    onToggle={() => setDevMode(!devMode)}
                  />
                </div>

                {devMode && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-300">
                          Últimas Requisições da API
                        </p>
                        <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                          {apiLogs.length} registros
                        </span>
                      </div>
                      <div className="space-y-2">
                        {apiLogs.length > 0 ? (
                          apiLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center justify-between font-mono text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded px-1.5 py-0.5 font-bold ${log.method === "GET" ? "bg-blue-900 text-blue-300" : "bg-amber-900 text-amber-300"}`}
                                >
                                  {log.method}
                                </span>
                                <span className="text-gray-400">
                                  {log.path}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`rounded px-1.5 py-0.5 ${log.status === 200 ? "bg-emerald-900 text-emerald-400" : "bg-red-900 text-red-400"}`}
                                >
                                  {log.status}
                                </span>
                                <span className="text-gray-500">
                                  {log.time}
                                </span>
                                <span className="text-gray-600">
                                  {log.date}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="py-4 text-center text-sm text-gray-500">
                            Ative o modo desenvolvedor para ver os logs.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Zona de Perigo */}
              <div className={`animate-in fade-in zoom-in-95 rounded-2xl border p-6 duration-200 ${isDark ? "border-red-500/30 bg-red-500/5" : "border-red-200 bg-red-50/50"}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? "bg-red-500/20" : "bg-red-100"}`}>
                    <AlertOctagon className={`h-5 w-5 ${isDark ? "text-red-400" : "text-red-600"}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-red-400" : "text-red-700"}`}>
                      Zona de Perigo
                    </h2>
                    <p className={`text-sm ${isDark ? "text-red-400/70" : "text-red-600"}`}>
                      Ações irreversíveis. Proceda com cuidado.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-red-500/20 bg-red-500/5" : "border-red-100 bg-red-50/50"}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Excluir todos os dashboards
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Remove permanentemente todos os seus painéis e
                        configurações visuais.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      <Trash className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                  <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-red-500/20 bg-red-500/5" : "border-red-100 bg-red-50/50"}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Resetar workspace
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Limpa todos os dados, uploads e configurações do
                        workspace.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Resetar
                    </button>
                  </div>
                  <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-red-500/20 bg-red-500/5" : "border-red-100 bg-red-50/50"}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                        Excluir conta permanentemente
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Remove sua conta, dados e acesso. Esta ação não pode ser
                        desfeita.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800"
                    >
                      <AlertOctagon className="h-4 w-4" />
                      Excluir Conta
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Webhook */}
              {showWebhookModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        Novo Webhook
                      </h3>
                      <button
                        onClick={() => setShowWebhookModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          URL do Webhook
                        </label>
                        <input
                          type="url"
                          value={newWebhook.url}
                          onChange={(e) =>
                            setNewWebhook({
                              ...newWebhook,
                              url: e.target.value,
                            })
                          }
                          className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 ${isDark ? "border-white/10 bg-white/5 text-white placeholder-gray-500" : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"}`}
                          placeholder="https://seu-servidor.com/webhook"
                        />
                      </div>
                      <div>
                        <label className={`mb-2 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                          Eventos
                        </label>
                        <div className="space-y-2">
                          {[
                            "dashboard_created",
                            "upload_completed",
                            "upload_failed",
                            "ai_insights_ready",
                            "db_connection_lost",
                          ].map((ev) => (
                            <label key={ev} className={`flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                              <input
                                type="checkbox"
                                checked={newWebhook.events.includes(ev)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewWebhook({
                                      ...newWebhook,
                                      events: [...newWebhook.events, ev],
                                    });
                                  } else {
                                    setNewWebhook({
                                      ...newWebhook,
                                      events: newWebhook.events.filter(
                                        (x) => x !== ev
                                      ),
                                    });
                                  }
                                }}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-400">
                                {ev.replace(/_/g, " ")}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowWebhookModal(false)}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (
                              newWebhook.url &&
                              newWebhook.events.length > 0
                            ) {
                              setWebhooks([
                                ...webhooks,
                                {
                                  id: Date.now().toString(),
                                  ...newWebhook,
                                  active: true,
                                },
                              ]);
                              setShowWebhookModal(false);
                            }
                          }}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                          disabled={
                            !newWebhook.url || newWebhook.events.length === 0
                          }
                        >
                          Criar Webhook
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Exportação */}
              {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        Exportar Dados da Conta
                      </h3>
                      <button
                        onClick={() => setShowExportModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    {!exportLoading ? (
                      <div className="space-y-4">
                        <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4">
                          <p className="text-sm text-indigo-300">
                            <span className="font-semibold">
                              O que será exportado:
                            </span>{" "}
                            dashboards, datasets, configurações de workspace,
                            preferências e logs de atividade.
                          </p>
                        </div>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          A exportação será preparada e disponibilizada para
                          download em instantes.
                        </p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowExportModal(false)}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${isDark ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              setExportLoading(true);
                              setTimeout(() => {
                                setExportLoading(false);
                                setShowExportModal(false);
                              }, 2000);
                            }}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                          >
                            <Download className="mr-1 inline h-4 w-4" />
                            Exportar JSON
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                        <p className="mt-3 text-sm font-medium text-gray-200">
                          Preparando exportação...
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Isso pode levar alguns instantes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Zona de Perigo */}
              {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="animate-in fade-in zoom-in-95 w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-lg">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                        <AlertOctagon className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-400">
                          Confirmação de Perigo
                        </h3>
                        <p className="text-sm text-red-400/70">
                          Esta ação é irreversível.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                        <p className="text-sm text-red-300">
                          Para confirmar, digite{" "}
                          <span className="font-bold">EXCLUIR</span> no campo
                          abaixo:
                        </p>
                      </div>
                      <input
                        type="text"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-red-500 focus:ring-red-500 placeholder-gray-500 ${isDark ? "border-red-500/30 bg-red-500/10 text-white" : "border-red-200 bg-red-50 text-gray-900"}`}
                        placeholder="Digite EXCLUIR para confirmar"
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteConfirm("");
                          }}
                          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
                        >
                          Cancelar
                        </button>
                        <button
                          disabled={deleteConfirm !== "EXCLUIR"}
                          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Confirmar Exclusão
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
