"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  ArrowRight,
  Loader,
  Database,
  HardDrive,
  Palette,
  Eye,
  EyeOff,
  Server,
  Shield,
  TestTube,
  Save,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sheet,
  BarChart3,
  Target,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { ColorPickerPopup } from "@/components/ColorPickerPopup";
import { useToast } from "@/components/ToastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

type ColumnMapping = "date" | "number" | "category" | "ignore";

type SheetData = {
  sheetName: string;
  data: any[];
  headers: string[];
  mapping: Record<string, ColumnMapping>;
};

type DbConfig = {
  host: string;
  port: string;
  dbname: string;
  user: string;
  password: string;
  tlsMode: string;
  application_name: string;
  connect_timeout: string;
  search_path: string;
};

type SavedConnection = {
  id: string;
  name: string;
  environment: "development" | "staging" | "production";
  config: DbConfig;
};

type GoogleSheet = {
  id: string;
  name: string;
  modifiedTime: string;
};

type MetaAdAccount = {
  id: string;
  name: string;
  accountStatus: number;
  currency: string;
};

type GAProperty = {
  id: string;
  displayName: string;
  accountName: string;
};

const emptyDbConfig = (): DbConfig => ({
  host: "",
  port: "5432",
  dbname: "",
  user: "",
  password: "",
  tlsMode: "require",
  application_name: "Profit BI",
  connect_timeout: "15",
  search_path: "",
});

const buildConnectionString = (cfg: DbConfig): string => {
  let uri = `postgresql://${encodeURIComponent(cfg.user)}`;
  if (cfg.password) uri += `:${encodeURIComponent(cfg.password)}`;
  uri += `@${cfg.host}:${cfg.port}/${cfg.dbname}`;
  const params: string[] = [];
  if (cfg.tlsMode !== "prefer") params.push(`sslmode=${cfg.tlsMode}`);
  if (cfg.application_name)
    params.push(`application_name=${encodeURIComponent(cfg.application_name)}`);
  if (cfg.connect_timeout)
    params.push(`connect_timeout=${cfg.connect_timeout}`);
  if (cfg.search_path)
    params.push(
      `options=-c%20search_path%3D${encodeURIComponent(cfg.search_path)}`
    );
  if (params.length > 0) uri += `?${params.join("&")}`;
  return uri;
};

const parseConnectionString = (uri: string): Partial<DbConfig> => {
  try {
    const url = new URL(uri.replace("postgresql://", "postgres://"));
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return {
      host: url.hostname,
      port: url.port || "5432",
      dbname: url.pathname.replace("/", ""),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password || ""),
      tlsMode: params.sslmode || "require",
      application_name: params.application_name || "Profit BI",
      connect_timeout: params.connect_timeout || "15",
      search_path: "",
    };
  } catch {
    return {};
  }
};

const SAVED_CONNECTIONS_KEY = "profit-bi-db-connections";

const loadSavedConnections = (): SavedConnection[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_CONNECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveConnections = (conns: SavedConnection[]) => {
  localStorage.setItem(SAVED_CONNECTIONS_KEY, JSON.stringify(conns));
};

export default function UploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Tab state: file, db, sheets, meta, analytics
  const [activeTab, setActiveTab] = useState<
    "file" | "db" | "sheets" | "meta" | "analytics"
  >("file");

  // Parse URL params from OAuth callbacks
  useEffect(() => {
    const sheetsParam = searchParams.get("sheets");
    const metaParam = searchParams.get("meta");
    const analyticsParam = searchParams.get("analytics");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      toast("error", `Erro na autenticação: ${errorParam}`);
    }

    if (sheetsParam === "true") {
      setActiveTab("sheets");
    } else if (metaParam === "true") {
      setActiveTab("meta");
    } else if (analyticsParam === "true") {
      setActiveTab("analytics");
    }
  }, [searchParams, toast]);

  // File states
  const [parsing, setParsing] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, ColumnMapping>>({});
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fullData, setFullData] = useState<any[]>([]);
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#06B6D4");

  // DB states
  const [dbConnected, setDbConnected] = useState(false);
  const [dbTableName, setDbTableName] = useState("");
  const [dbUseUri, setDbUseUri] = useState(false);
  const [dbUri, setDbUri] = useState("");
  const [dbConfig, setDbConfig] = useState<DbConfig>(emptyDbConfig());
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedConnections, setSavedConnections] =
    useState<SavedConnection[]>(loadSavedConnections);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [connectionName, setConnectionName] = useState("");
  const [connectionEnv, setConnectionEnv] = useState<
    "development" | "staging" | "production"
  >("development");
  const [showSavedList, setShowSavedList] = useState(false);

  // Google Sheets states
  const [sheetsToken, setSheetsToken] = useState("");
  const [googleSheets, setGoogleSheets] = useState<GoogleSheet[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [selectedSheetName, setSelectedSheetName] = useState("");
  const [availableSheetNames, setAvailableSheetNames] = useState<string[]>([]);
  const [processingSheets, setProcessingSheets] = useState(false);

  // Meta Ads states
  const [metaToken, setMetaToken] = useState("");
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState("");
  const [metaDateStart, setMetaDateStart] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [metaDateEnd, setMetaDateEnd] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [processingMeta, setProcessingMeta] = useState(false);

  // Google Analytics states
  const [analyticsToken, setAnalyticsToken] = useState("");
  const [gaProperties, setGaProperties] = useState<GAProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [gaDateStart, setGaDateStart] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [gaDateEnd, setGaDateEnd] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [processingAnalytics, setProcessingAnalytics] = useState(false);

  // Parse URL data on mount
  useEffect(() => {
    const filesParam = searchParams.get("files");
    const tokenParam = searchParams.get("token");
    const accountsParam = searchParams.get("accounts");
    const propertiesParam = searchParams.get("properties");

    if (filesParam && tokenParam) {
      try {
        setGoogleSheets(JSON.parse(filesParam));
        setSheetsToken(tokenParam);
      } catch {}
    }
    if (accountsParam && tokenParam) {
      try {
        setAdAccounts(JSON.parse(accountsParam));
        setMetaToken(tokenParam);
      } catch {}
    }
    if (propertiesParam && tokenParam) {
      try {
        setGaProperties(JSON.parse(propertiesParam));
        setAnalyticsToken(tokenParam);
      } catch {}
    }
  }, [searchParams]);

  const suggestMapping = (fields: string[], data: any[]) => {
    const suggestion: Record<string, ColumnMapping> = {};
    fields.forEach((field) => {
      const lowerField = field.toLowerCase();
      const sampleValue = data[0]?.[field];
      if (
        lowerField.includes("data") ||
        lowerField.includes("date") ||
        lowerField.includes("dia") ||
        lowerField.includes("created")
      ) {
        suggestion[field] = "date";
      } else if (
        lowerField.includes("valor") ||
        lowerField.includes("total") ||
        lowerField.includes("preço") ||
        lowerField.includes("amount") ||
        (!isNaN(Number(sampleValue)) && sampleValue !== "")
      ) {
        suggestion[field] = "number";
      } else {
        suggestion[field] = "category";
      }
    });
    setMapping(suggestion);
  };

  const handleMappingChange = (field: string, type: ColumnMapping) => {
    setMapping((prev) => ({ ...prev, [field]: type }));
  };

  const resetState = () => {
    setHeaders([]);
    setPreviewRows([]);
    setMapping({});
    setFile(null);
    setFullData([]);
    setDbConnected(false);
    setPrimaryColor("#4F46E5");
    setSecondaryColor("#06B6D4");
    setDbConfig(emptyDbConfig());
    setDbUri("");
    setConnectionError("");
    setDbTableName("");
    setSelectedSheetId("");
    setSelectedSheetName("");
    setAvailableSheetNames([]);
    setSelectedAdAccount("");
    setSelectedProperty("");
  };

  // ---------------- FILE LOGIC ----------------
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      parseFile(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const parseFile = (file: File) => {
    setParsing(true);
    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setHeaders(results.meta.fields);
            setPreviewRows(results.data.slice(0, 5));
            setFullData(results.data);
            suggestMapping(results.meta.fields, results.data);
          }
          setParsing(false);
        },
        error: () => {
          toast("error", "Erro ao ler CSV.");
          setParsing(false);
        },
      });
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const mergedHeaders = new Set<string>();
          const mergedData: any[] = [];

          workbook.SheetNames.forEach((sheetName) => {
            const jsonData = XLSX.utils.sheet_to_json(
              workbook.Sheets[sheetName],
              { defval: "" }
            ) as any[];
            if (jsonData.length > 0) {
              jsonData.forEach((row) => {
                const newRow = { ...row, Aba_Origem: sheetName };
                Object.keys(newRow).forEach((k) => mergedHeaders.add(k));
                mergedData.push(newRow);
              });
            }
          });

          if (mergedData.length > 0) {
            const finalHeaders = Array.from(mergedHeaders);
            const suggestion: Record<string, ColumnMapping> = {};
            finalHeaders.forEach((field) => {
              const lowerField = field.toLowerCase();
              const findRow = mergedData.find(
                (r) => r[field] !== "" && r[field] !== undefined
              );
              const sampleValue = findRow ? findRow[field] : "";
              if (
                lowerField.includes("data") ||
                lowerField.includes("date") ||
                lowerField.includes("dia")
              ) {
                suggestion[field] = "date";
              } else if (
                lowerField.includes("valor") ||
                lowerField.includes("total") ||
                lowerField.includes("preço") ||
                lowerField.includes("amount") ||
                (!isNaN(Number(sampleValue)) && sampleValue !== "")
              ) {
                suggestion[field] = "number";
              } else {
                suggestion[field] = "category";
              }
            });
            suggestion["Aba_Origem"] = "category";
            setHeaders(finalHeaders);
            setPreviewRows(mergedData.slice(0, 5));
            setFullData(mergedData);
            setMapping(suggestion);
          } else {
            toast("error", "Nenhuma aba com dados foi encontrada.");
          }
        } catch (err: any) {
          toast("error", "Erro ao ler Excel: " + err.message);
        } finally {
          setParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast("error", "Formato não suportado.");
      setParsing(false);
    }
  };

  // ---------------- DB LOGIC ----------------
  const getCurrentConnectionString = (): string => {
    if (dbUseUri) return dbUri;
    return buildConnectionString(dbConfig);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionError("");
    try {
      const connectionString = getCurrentConnectionString();
      if (!connectionString) {
        setConnectionError("Preencha todos os campos obrigatórios.");
        setTestingConnection(false);
        return;
      }
      if (!dbTableName.trim()) {
        setConnectionError("Informe o nome da tabela.");
        setTestingConnection(false);
        return;
      }

      const res = await fetch("/api/datasets/db/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString,
          tableName: dbTableName.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setHeaders(json.headers);
      setPreviewRows(json.previewRows);
      suggestMapping(json.headers, json.previewRows);
      setDbConnected(true);
      toast("success", "Conexão estabelecida com sucesso!");
    } catch (e: any) {
      setConnectionError(e.message);
      setDbConnected(false);
      toast("error", "Falha na conexão: " + e.message);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConnection = () => {
    if (dbUseUri) {
      const parsed = parseConnectionString(dbUri);
      if (!parsed.host || !parsed.dbname || !parsed.user) {
        toast(
          "error",
          "Connection string inválida. Não foi possível extrair os dados."
        );
        return;
      }
      setDbConfig({ ...emptyDbConfig(), ...parsed } as DbConfig);
    }

    const name =
      connectionName.trim() ||
      `${dbConfig.host}:${dbConfig.port}/${dbConfig.dbname}`;
    const newConn: SavedConnection = {
      id: Date.now().toString(),
      name,
      environment: connectionEnv,
      config: { ...dbConfig },
    };
    const updated = [...savedConnections, newConn];
    setSavedConnections(updated);
    saveConnections(updated);
    setSelectedConnectionId(newConn.id);
    toast("success", `Conexão "${name}" salva com sucesso!`);
  };

  const handleLoadConnection = (conn: SavedConnection) => {
    setDbConfig(conn.config);
    setDbUseUri(false);
    setSelectedConnectionId(conn.id);
    setConnectionName(conn.name);
    setConnectionEnv(conn.environment);
    setShowSavedList(false);
    toast("info", `Conexão "${conn.name}" carregada.`);
  };

  const handleDeleteConnection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedConnections.filter((c) => c.id !== id);
    setSavedConnections(updated);
    saveConnections(updated);
    if (selectedConnectionId === id) {
      setSelectedConnectionId("");
      setDbConfig(emptyDbConfig());
    }
    toast("info", "Conexão removida.");
  };

  const handleCopyConnectionString = () => {
    const uri = getCurrentConnectionString();
    navigator.clipboard.writeText(uri);
    toast("success", "Connection string copiada!");
  };

  // ---------------- INTEGRATION LOGIC ----------------
  const handleProcessSheets = async () => {
    if (!selectedSheetId || !sheetsToken) {
      toast("error", "Selecione uma planilha.");
      return;
    }
    setProcessingSheets(true);
    try {
      const res = await fetch("/api/integrations/google-sheets/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId: selectedSheetId,
          sheetName: selectedSheetName,
          token: sheetsToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast("success", `Dashboard gerado com sucesso! ${data.rowCount || ""} linhas processadas.`);
      router.push(`/dashboard/bi/${data.datasetId}`);
    } catch (e: any) {
      toast("error", "Erro: " + e.message);
    } finally {
      setProcessingSheets(false);
    }
  };

  const handleProcessMeta = async () => {
    if (!selectedAdAccount || !metaToken) {
      toast("error", "Selecione uma conta de anúncios.");
      return;
    }
    setProcessingMeta(true);
    try {
      const res = await fetch("/api/integrations/meta-ads/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adAccountId: selectedAdAccount,
          dateStart: metaDateStart,
          dateEnd: metaDateEnd,
          token: metaToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast("success", `Dashboard gerado! ${data.rowCount} campanhas processadas.`);
      router.push(`/dashboard/bi/${data.datasetId}`);
    } catch (e: any) {
      toast("error", "Erro: " + e.message);
    } finally {
      setProcessingMeta(false);
    }
  };

  const handleProcessAnalytics = async () => {
    if (!selectedProperty || !analyticsToken) {
      toast("error", "Selecione uma propriedade do Google Analytics.");
      return;
    }
    setProcessingAnalytics(true);
    try {
      const res = await fetch("/api/integrations/google-analytics/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProperty,
          dateStart: gaDateStart,
          dateEnd: gaDateEnd,
          token: analyticsToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast("success", `Dashboard gerado! ${data.rowCount} registros processados.`);
      router.push(`/dashboard/bi/${data.datasetId}`);
    } catch (e: any) {
      toast("error", "Erro: " + e.message);
    } finally {
      setProcessingAnalytics(false);
    }
  };

  // ---------------- SUBMIT LOGIC (File/DB) ----------------
  const handleProcess = async () => {
    setUploading(true);
    try {
      let endpoint = "";
      let payload = {};

      if (activeTab === "file") {
        if (!file || fullData.length === 0)
          throw new Error("Arquivo não encontrado ou sem dados.");
        endpoint = "/api/datasets/upload";
        payload = {
          fileName: file.name.replace(/\.[^/.]+$/, ""),
          mapping,
          rows: fullData,
          primaryColor,
          secondaryColor,
        };
      } else {
        if (!dbConnected)
          throw new Error("Conexão com Banco não estabelecida.");
        endpoint = "/api/datasets/db/process";
        payload = {
          connectionString: getCurrentConnectionString(),
          tableName: dbTableName,
          mapping,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro no upload/ETL");
      }

      const data = await res.json();
      toast("success", "Sucesso! O Dashboard foi gerado.");
      router.push(`/dashboard/bi/${data.datasetId}`);
    } catch (error: any) {
      toast("error", "Erro: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const envColors = {
    development: "bg-blue-100 text-blue-700",
    staging: "bg-amber-100 text-amber-700",
    production: "bg-red-100 text-red-700",
  };

  const envLabels = {
    development: "Desenvolvimento",
    staging: "Homologação",
    production: "Produção",
  };

  const tabs = [
    { id: "file" as const, icon: HardDrive, label: "Arquivo" },
    { id: "db" as const, icon: Database, label: "Banco SQL" },
    { id: "sheets" as const, icon: Sheet, label: "Google Sheets" },
    { id: "meta" as const, icon: Target, label: "Meta Ads" },
    { id: "analytics" as const, icon: BarChart3, label: "Google Analytics" },
  ];

  return (
    <div className="mx-auto max-w-5xl py-8">
      <div className="mb-8 flex flex-col items-center">
        <h1 className={`mb-2 text-3xl font-bold ${isDark ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent" : "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent"}`}>
          Importação de Dados
        </h1>
        <p className={`text-center max-w-lg ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Conecte seu negócio e deixe a inteligência artificial gerar seus
          indicadores automaticamente.
        </p>

        {/* Tab Navigation */}
        <div className={`mx-auto mt-8 flex w-full max-w-2xl rounded-xl border p-1 shadow-inner ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetState();
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? isDark
                    ? "border border-gray-600 bg-slate-900 text-indigo-400 shadow"
                    : "border border-gray-200 bg-white text-indigo-700 shadow"
                  : isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ------------ TAB: FILE UPLOAD ------------ */}
      {activeTab === "file" && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          {!file ? (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-colors ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : isDark
                    ? "border-gray-600 bg-slate-900 hover:border-indigo-500"
                    : "border-gray-300 bg-white hover:border-indigo-400"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className={`mx-auto mb-4 h-12 w-12 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
              <h3 className={`text-lg font-semibold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Arraste a Planilha (CSV, XLS, XLSX)
              </h3>
              <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Nativo, sem precisar hospedar banco de dados
              </p>
            </div>
          ) : (
            <div className={`mb-6 flex items-center justify-between rounded-lg border p-4 ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"}`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{file.name}</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={resetState}
                className="text-sm font-medium text-red-500 hover:text-red-700"
              >
                Trocar Arquivo
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------ TAB: DATABASE ------------ */}
      {activeTab === "db" && (
        <div className="animate-in fade-in zoom-in-95 mb-6 space-y-4 duration-200">
          {!dbConnected ? (
            <>
              {savedConnections.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Save className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-base font-bold text-gray-800">
                        Conexões Salvas
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowSavedList(!showSavedList)}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {showSavedList ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {showSavedList ? "Fechar" : "Ver todas"}
                    </button>
                  </div>
                  {showSavedList ? (
                    <div className="space-y-2">
                      {savedConnections.map((conn) => (
                        <div
                          key={conn.id}
                          onClick={() => handleLoadConnection(conn)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                            selectedConnectionId === conn.id
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Database className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {conn.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {conn.config.host}:{conn.config.port}/
                                {conn.config.dbname}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${envColors[conn.environment]}`}
                            >
                              {envLabels[conn.environment]}
                            </span>
                            <button
                              onClick={(e) => handleDeleteConnection(conn.id, e)}
                              className="rounded p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto">
                      {savedConnections.slice(0, 3).map((conn) => (
                        <button
                          key={conn.id}
                          onClick={() => handleLoadConnection(conn)}
                          className={`flex-shrink-0 rounded-lg border p-3 text-left transition-colors ${
                            selectedConnectionId === conn.id
                              ? "border-indigo-300 bg-indigo-50"
                              : "border-gray-200 hover:border-indigo-200"
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-800">
                            {conn.name}
                          </p>
                          <span
                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${envColors[conn.environment]}`}
                          >
                            {envLabels[conn.environment]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-base font-bold text-gray-800">
                      Configuração de Conexão
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setDbUseUri(!dbUseUri);
                      setConnectionError("");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    {dbUseUri
                      ? "Usar campos individuais"
                      : "Usar Connection String"}
                  </button>
                </div>

                {dbUseUri ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Connection String Completa
                      </label>
                      <input
                        type="text"
                        value={dbUri}
                        onChange={(e) => setDbUri(e.target.value)}
                        placeholder="postgresql://usuario:senha@host:5432/nome_do_banco?sslmode=require"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          Host <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={dbConfig.host}
                          onChange={(e) =>
                            setDbConfig({ ...dbConfig, host: e.target.value })
                          }
                          placeholder="localhost"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          Porta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={dbConfig.port}
                          onChange={(e) =>
                            setDbConfig({ ...dbConfig, port: e.target.value })
                          }
                          placeholder="5432"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          Banco de Dados <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={dbConfig.dbname}
                          onChange={(e) =>
                            setDbConfig({ ...dbConfig, dbname: e.target.value })
                          }
                          placeholder="nome_do_banco"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                          Usuário <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={dbConfig.user}
                          onChange={(e) =>
                            setDbConfig({ ...dbConfig, user: e.target.value })
                          }
                          placeholder="usuario"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                        Senha <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={dbConfig.password}
                          onChange={(e) =>
                            setDbConfig({
                              ...dbConfig,
                              password: e.target.value,
                            })
                          }
                          placeholder="senha_do_banco"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Shield className="h-4 w-4" /> Modo TLS
                      </label>
                      <select
                        value={dbConfig.tlsMode}
                        onChange={(e) =>
                          setDbConfig({ ...dbConfig, tlsMode: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="disable">disable</option>
                        <option value="prefer">prefer</option>
                        <option value="require">require (recomendado)</option>
                        <option value="verify-ca">verify-ca</option>
                        <option value="verify-full">verify-full</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700">
                    Nome da Tabela <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbTableName}
                    onChange={(e) => setDbTableName(e.target.value)}
                    placeholder='ex: vendas, public.pedidos'
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {connectionError && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Erro de Conexão
                      </p>
                      <p className="text-xs text-red-600">{connectionError}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection}
                      className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                    >
                      {testingConnection ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                      Testar Conexão
                    </button>
                    <button
                      onClick={handleCopyConnectionString}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar URI
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                      placeholder="Nome da conexão"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <select
                      value={connectionEnv}
                      onChange={(e) =>
                        setConnectionEnv(e.target.value as any)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="development">Desenvolvimento</option>
                      <option value="staging">Homologação</option>
                      <option value="production">Produção</option>
                    </select>
                    <button
                      onClick={handleSaveConnection}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4" />
                      Salvar
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition hover:bg-black disabled:opacity-50"
                >
                  {testingConnection ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {testingConnection
                    ? "Testando conexão..."
                    : "Testar Conexão e Obter Preview"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-3 text-emerald-600">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Conexão Estabelecida
                  </p>
                  <p className="text-sm text-gray-500">
                    Tabela{" "}
                    <span className="rounded bg-indigo-50 px-1 font-mono text-indigo-600">
                      {dbTableName}
                    </span>{" "}
                    pronta para ETL
                  </p>
                </div>
              </div>
              <button
                onClick={resetState}
                className="text-sm font-medium text-red-500 hover:text-red-700"
              >
                Trocar Tabela / DB
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------ TAB: GOOGLE SHEETS ------------ */}
      {activeTab === "sheets" && (
        <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6">
          {googleSheets.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
              <Sheet className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                Conectar com Google Sheets
              </h3>
              <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Conecte sua conta do Google para acessar suas planilhas. Seus dados são lidos apenas para gerar o dashboard.
              </p>
              <a
                href="/api/integrations/google-sheets/auth"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Conectar com Google
              </a>
            </div>
          ) : (
            <>
              <div className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sheet className="h-5 w-5 text-green-500" />
                    <h3 className={`text-base font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      Suas Planilhas
                    </h3>
                  </div>
                  <a
                    href="/api/integrations/google-sheets/auth"
                    className="text-sm text-indigo-500 hover:text-indigo-400"
                  >
                    Trocar conta
                  </a>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {googleSheets.map((sheet) => (
                    <button
                      key={sheet.id}
                      onClick={() => {
                        if (selectedSheetId === sheet.id) {
                          setSelectedSheetId("");
                        } else {
                          setSelectedSheetId(sheet.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedSheetId === sheet.id
                          ? isDark
                            ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/30"
                            : "border-green-400 bg-green-50 ring-2 ring-green-400/30"
                          : isDark
                            ? "border-gray-700 hover:border-green-500/50 hover:bg-gray-800"
                            : "border-gray-200 hover:border-green-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          {sheet.name}
                        </p>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {new Date(sheet.modifiedTime).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {selectedSheetId === sheet.id && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSheetId && (
                <button
                  onClick={handleProcessSheets}
                  disabled={processingSheets}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-4 font-semibold text-white text-lg shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingSheets ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                  {processingSheets
                    ? "Processando planilha..."
                    : "Gerar Dashboard com IA"}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ------------ TAB: META ADS ------------ */}
      {activeTab === "meta" && (
        <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6">
          {adAccounts.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
              <Target className="mx-auto mb-4 h-12 w-12 text-blue-500" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                Conectar com Meta Ads
              </h3>
              <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Conecte sua conta do Facebook/Instagram para importar dados de campanhas de anúncios.
              </p>
              <a
                href="/api/integrations/meta-ads/auth"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Conectar com Meta
              </a>
            </div>
          ) : (
            <>
              <div className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className={`text-base font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      Contas de Anúncios
                    </h3>
                  </div>
                  <a
                    href="/api/integrations/meta-ads/auth"
                    className="text-sm text-indigo-500 hover:text-indigo-400"
                  >
                    Trocar conta
                  </a>
                </div>
                <div className="space-y-2">
                  {adAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => {
                        if (selectedAdAccount === account.id) {
                          setSelectedAdAccount("");
                        } else {
                          setSelectedAdAccount(account.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedAdAccount === account.id
                          ? isDark
                            ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30"
                            : "border-blue-400 bg-blue-50 ring-2 ring-blue-400/30"
                          : isDark
                            ? "border-gray-700 hover:border-blue-500/50 hover:bg-gray-800"
                            : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          {account.name}
                        </p>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          ID: {account.id} • Moeda: {account.currency}
                        </p>
                      </div>
                      {selectedAdAccount === account.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAdAccount && (
                <div className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                  <h3 className={`text-base font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    Período dos Dados
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Data Início
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={metaDateStart}
                          onChange={(e) => setMetaDateStart(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Data Fim
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={metaDateEnd}
                          onChange={(e) => setMetaDateEnd(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleProcessMeta}
                    disabled={processingMeta}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 font-medium text-white transition disabled:opacity-50"
                  >
                    {processingMeta ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {processingMeta
                      ? "Importando dados do Meta..."
                      : "Gerar Dashboard"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ------------ TAB: GOOGLE ANALYTICS ------------ */}
      {activeTab === "analytics" && (
        <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6">
          {gaProperties.length === 0 ? (
            <div className={`rounded-xl border p-12 text-center shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
              <BarChart3 className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                Conectar com Google Analytics
              </h3>
              <p className={`text-sm mb-6 max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Conecte sua conta do Google Analytics (GA4) para importar dados de tráfego e comportamento do site.
              </p>
              <a
                href="/api/integrations/google-analytics/auth"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Conectar com Google Analytics
              </a>
            </div>
          ) : (
            <>
              <div className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-yellow-500" />
                    <h3 className={`text-base font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                      Propriedades GA4
                    </h3>
                  </div>
                  <a
                    href="/api/integrations/google-analytics/auth"
                    className="text-sm text-indigo-500 hover:text-indigo-400"
                  >
                    Trocar conta
                  </a>
                </div>
                <div className="space-y-2">
                  {gaProperties.map((prop) => (
                    <button
                      key={prop.id}
                      onClick={() => {
                        if (selectedProperty === prop.id) {
                          setSelectedProperty("");
                        } else {
                          setSelectedProperty(prop.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedProperty === prop.id
                          ? isDark
                            ? "border-yellow-500 bg-yellow-500/10 ring-2 ring-yellow-500/30"
                            : "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-400/30"
                          : isDark
                            ? "border-gray-700 hover:border-yellow-500/50 hover:bg-gray-800"
                            : "border-gray-200 hover:border-yellow-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                          {prop.displayName}
                        </p>
                        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          Conta: {prop.accountName}
                        </p>
                      </div>
                      {selectedProperty === prop.id && (
                        <CheckCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedProperty && (
                <div className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-gray-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
                  <h3 className={`text-base font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    Período dos Dados
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`mb-1 block text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Data Início
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={gaDateStart}
                          onChange={(e) => setGaDateStart(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Data Fim
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={gaDateEnd}
                          onChange={(e) => setGaDateEnd(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-yellow-500 focus:ring-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleProcessAnalytics}
                    disabled={processingAnalytics}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 px-4 py-2.5 font-medium text-white transition disabled:opacity-50"
                  >
                    {processingAnalytics ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {processingAnalytics
                      ? "Importando dados do GA4..."
                      : "Gerar Dashboard"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ------------ MAPPING (File/DB only) ------------ */}
      {parsing && activeTab === "file" && (
        <div className="p-12 text-center text-gray-500">
          Analisando arquitetura da planilha...
        </div>
      )}

      {headers.length > 0 && (activeTab === "file" || activeTab === "db") && (
        <div className={`animate-in slide-in-from-bottom-2 overflow-hidden rounded-xl border shadow-sm duration-300 ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-white"}`}>
          <div className={`border-b p-6 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-100 bg-gray-50"}`}>
            <h2 className={`flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              <CheckCircle className="h-5 w-5 text-indigo-500" />
              Super Mapeamento (Engine Aglutinadora)
            </h2>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Todas as abas foram fundidas em apenas um Super Conjunto de Dados.
              A IA vai produzir relatórios cruzando todas as informações!
            </p>
          </div>

          <div className={`max-h-96 divide-y overflow-y-auto ${isDark ? "divide-slate-700" : "divide-gray-100"}`}>
            {headers.map((header) => {
              const sampleInstance = fullData.find(
                (row) => row[header] !== undefined && row[header] !== ""
              );
              const sampleText = sampleInstance
                ? String(sampleInstance[header]).substring(0, 30)
                : "-";

              return (
                <div
                  key={header}
                  className={`flex items-center justify-between p-4 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"}`}
                >
                  <div className="w-1/2 flex-1 pr-4">
                    <p className={`font-mono text-sm font-semibold ${isDark ? "text-white" : "text-gray-700"}`}>
                      {header}
                    </p>
                    <p className={`mt-1 truncate text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                      Ex:{" "}
                      <span className={`rounded px-1 py-0.5 ${isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600"}`}>
                        {sampleText}
                      </span>
                    </p>
                  </div>
                  <div className="w-48 flex-shrink-0">
                    <select
                      value={mapping[header] || "category"}
                      onChange={(e) =>
                        handleMappingChange(
                          header,
                          e.target.value as ColumnMapping
                        )
                      }
                      className={`w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDark ? "border-slate-600 bg-slate-800 text-white" : "border-gray-300 bg-white"}`}
                    >
                      <option value="date">📅 É uma Data</option>
                      <option value="number">💲 É Valor/Número</option>
                      <option value="category">🏷️ Categoria/Texto</option>
                      <option value="ignore">❌ Ignorar</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Palette */}
          <div className={`border-t p-6 ${isDark ? "border-slate-700" : "border-gray-100"}`}>
            <div className="mb-1 flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-500" />
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                Paleta de Cores da Empresa
              </h3>
            </div>
            <p className={`mb-5 text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              Escolha as cores da sua marca para os dashboards.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-700"}`}>
                  Cor Primária
                </label>
                <div className={`flex items-center gap-3 rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <ColorPickerPopup
                    value={primaryColor}
                    onChange={setPrimaryColor}
                    align="left"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`font-mono text-sm font-bold ${isDark ? "text-white" : "text-gray-700"}`}>
                      {primaryColor.toUpperCase()}
                    </p>
                  </div>
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-full shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}88)`,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-700"}`}>
                  Cor Secundária
                </label>
                <div className={`flex items-center gap-3 rounded-xl border p-3 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
                  <ColorPickerPopup
                    value={secondaryColor}
                    onChange={setSecondaryColor}
                    align="right"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`font-mono text-sm font-bold ${isDark ? "text-white" : "text-gray-700"}`}>
                      {secondaryColor.toUpperCase()}
                    </p>
                  </div>
                  <div
                    className="h-8 w-8 flex-shrink-0 rounded-full shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${secondaryColor}, ${secondaryColor}88)`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`flex justify-end border-t p-6 ${isDark ? "border-slate-700 bg-slate-800" : "border-gray-200 bg-gray-50"}`}>
            <button
              onClick={handleProcess}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl px-8 py-3 font-medium text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {uploading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
              {uploading
                ? "Salvando e Acionando IA..."
                : "Confirmar e Gerar Dashboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
