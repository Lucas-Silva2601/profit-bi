"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/utils/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Phone,
  Calendar,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function getPasswordStrength(password: string): {
  strength: PasswordStrength;
  requirements: PasswordRequirements;
  score: number;
} {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  let strength: PasswordStrength;
  if (score <= 2) strength = "weak";
  else if (score === 3) strength = "medium";
  else if (score === 4) strength = "strong";
  else strength = "very-strong";

  return { strength, requirements, score };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  const { strength, requirements, score } = getPasswordStrength(password);

  const strengthConfig = {
    weak: { label: "Fraca", color: "bg-red-500", textColor: "text-red-600" },
    medium: {
      label: "Média",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    strong: {
      label: "Forte",
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    "very-strong": {
      label: "Muito forte",
      color: "bg-green-600",
      textColor: "text-green-700",
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600">
          Força da senha:
        </span>
        <span className={`text-xs font-semibold ${config.textColor}`}>
          {config.label}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              level <= score ? config.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        <RequirementItem
          met={requirements.minLength}
          label="Mínimo 8 caracteres"
        />
        <RequirementItem
          met={requirements.hasUppercase}
          label="Uma letra maiúscula"
        />
        <RequirementItem
          met={requirements.hasLowercase}
          label="Uma letra minúscula"
        />
        <RequirementItem met={requirements.hasNumber} label="Um número" />
        <RequirementItem
          met={requirements.hasSpecial}
          label="Um caractere especial (!@#$%^&*)"
        />
      </div>
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-gray-300" />
      )}
      <span className={met ? "text-emerald-600" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const validateEmails = (): boolean => {
    if (!email || !confirmEmail) {
      toast("error", "Por favor, preencha ambos os campos de e-mail.");
      return false;
    }
    if (email !== confirmEmail) {
      toast("error", "Os e-mails não coincidem.");
      return false;
    }
    return true;
  };

  const validatePasswords = (): boolean => {
    if (!password || !confirmPassword) {
      toast("error", "Por favor, preencha ambos os campos de senha.");
      return false;
    }
    if (password !== confirmPassword) {
      toast("error", "As senhas não coincidem.");
      return false;
    }
    const { score } = getPasswordStrength(password);
    if (score < 3) {
      toast(
        "error",
        "A senha é muito fraca. Atenda aos requisitos de segurança.",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmails()) {
      setLoading(false);
      return;
    }

    if (!validatePasswords()) {
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        if (error.message?.toLowerCase().includes("invalid")) {
          toast("error", "E-mail ou senha incorretos.");
        } else {
          toast("error", error.message || "Erro ao entrar.");
        }
      } else {
        toast("success", "Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: fullName || email.split("@")[0],
      });
      if (error) {
        if (error.message?.toLowerCase().includes("already")) {
          toast(
            "error",
            "Este e-mail já está cadastrado. Faça login ou use outro e-mail.",
          );
        } else {
          toast("error", error.message || "Erro ao criar conta.");
        }
      } else {
        // Sessão criada — salva os dados extras do perfil (nascimento, telefone, gênero)
        if (dateOfBirth || phone || gender) {
          await fetch("/api/profile/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: fullName || email.split("@")[0],
              dateOfBirth: dateOfBirth || null,
              phone: phone || null,
              gender: gender || null,
            }),
          });
        }
        toast("success", "Conta criada com sucesso! Bem-vindo ao Profit BI.");
        router.push("/dashboard");
        router.refresh();
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      newUserCallbackURL: "/dashboard",
    });

    if (error) {
      toast("error", error.message || "Erro ao conectar com o Google.");
      setGoogleLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 7) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    setPhone(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-indigo-600">Profit</span> BI
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Business Intelligence simplificado para o seu negócio
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1.5">
            <button
              onClick={() => {
                setMode("login");
                setConfirmEmail("");
                setConfirmPassword("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setMode("register");
                setConfirmEmail("");
                setConfirmPassword("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-6"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {googleLoading ? "Conectando..." : "Continuar com Google"}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-400 uppercase tracking-wide">
                ou use seu e-mail
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="João Silva"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Data de nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gênero
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
                  >
                    <option value="">Selecione (opcional)</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="non_binary">Não-binário</option>
                    <option value="other">Outro</option>
                    <option value="prefer_not_to_say">
                      Prefiro não informar
                    </option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="voce@empresa.com"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  required
                  placeholder="voce@empresa.com"
                  className={`w-full border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    confirmEmail && email !== confirmEmail
                      ? "border-red-300 bg-red-50"
                      : confirmEmail && email === confirmEmail
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                />
                {confirmEmail && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {email === confirmEmail ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {confirmEmail && email !== confirmEmail && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Os e-mails não coincidem
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <PasswordStrengthIndicator password={password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full border rounded-lg pl-10 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 bg-red-50"
                      : confirmPassword && password === confirmPassword
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {confirmPassword && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {password === confirmPassword ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  As senhas não coincidem
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 shadow-sm hover:shadow-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login"
                ? "Entrar na conta"
                : "Criar minha conta grátis"}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-4 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          <p>Profit BI — Business Intelligence para todos os negócios.</p>
          <p className="mt-1">
            Ao se cadastrar ou entrar, você aceita nossos{" "}
            <Link
              href="/terms"
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors hover:underline"
            >
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link
              href="/privacy"
              className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
