import Link from "next/link";
import {
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Check,
  ArrowRight,
  Star,
  Database,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Server,
  Lock,
  Users,
  ChevronDown,
  Upload,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Inter', 'Montserrat', sans-serif" }}
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-indigo-600">Profit</span>
                <span className="text-gray-900"> BI</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#problema"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                O Problema
              </a>
              <a
                href="#solucao"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Solução
              </a>
              <a
                href="#integracoes"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Integrações
              </a>
              <a
                href="#precos"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Preços
              </a>
              <a
                href="#faq"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/login?mode=register"
                className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-5 py-2 mb-8">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">
              Dashboards de nível executivo em menos de 10 segundos
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-[1.08]">
            Dashboards incríveis.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Em menos de 10 segundos.
            </span>
          </h1>

          <p className="mt-8 text-xl sm:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Conecte seu banco de dados ou faça upload da sua planilha Excel.
            <span className="text-gray-700 font-medium">
              {" "}
              Sem fórmulas, sem código, apenas clareza para decidir melhor.
            </span>
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              Começar meu Dashboard Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              Setup em 2 minutos
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Dados protegidos por LGPD
            </div>
          </div>

          {/* Visual: Dashboard preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-[#1a1f36] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 max-w-5xl mx-auto">
              <div className="flex items-center justify-between px-5 py-3 bg-[#151929] border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Profit BI — Dashboard
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Jonathan Doe</span>
                  <div className="w-6 h-6 rounded bg-slate-700" />
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-[#1a1f36] to-[#151929]">
                {/* Top row: 3 Donut KPIs + 2 mini bars */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                  {/* Donut KPI 1 */}
                  <div className="col-span-1 bg-[#1e2444] rounded-xl p-4 border border-slate-700/30">
                    <div className="flex justify-center mb-3">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#2a3054" strokeWidth="8" />
                        <circle cx="40" cy="40" r="32" fill="none" stroke="url(#grad1)" strokeWidth="8" strokeDasharray="160 201" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 40 40)" />
                        <defs>
                          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <text x="40" y="38" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">285</text>
                        <text x="40" y="52" textAnchor="middle" fill="#94a3b8" fontSize="8">Month</text>
                      </svg>
                    </div>
                    <p className="text-center text-[10px] text-emerald-400 font-medium">+78 (5.2%) ↑</p>
                  </div>

                  {/* Donut KPI 2 */}
                  <div className="col-span-1 bg-[#1e2444] rounded-xl p-4 border border-slate-700/30">
                    <div className="flex justify-center mb-3">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#2a3054" strokeWidth="8" />
                        <circle cx="40" cy="40" r="32" fill="none" stroke="url(#grad2)" strokeWidth="8" strokeDasharray="140 201" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 40 40)" />
                        <defs>
                          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <text x="40" y="38" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">197</text>
                        <text x="40" y="52" textAnchor="middle" fill="#94a3b8" fontSize="8">Day</text>
                      </svg>
                    </div>
                    <p className="text-center text-[10px] text-emerald-400 font-medium">+42 (3.1%) ↑</p>
                  </div>

                  {/* Donut KPI 3 */}
                  <div className="col-span-1 bg-[#1e2444] rounded-xl p-4 border border-slate-700/30">
                    <div className="flex justify-center mb-3">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="#2a3054" strokeWidth="8" />
                        <circle cx="40" cy="40" r="32" fill="none" stroke="url(#grad3)" strokeWidth="8" strokeDasharray="180 201" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 40 40)" />
                        <defs>
                          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                        <text x="40" y="38" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">352</text>
                        <text x="40" y="52" textAnchor="middle" fill="#94a3b8" fontSize="8">Year</text>
                      </svg>
                    </div>
                    <p className="text-center text-[10px] text-red-400 font-medium">-12 (0.8%) ↓</p>
                  </div>

                  {/* Mini bar charts */}
                  <div className="col-span-2 space-y-3">
                    <div className="bg-[#1e2444] rounded-xl p-3 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-400 font-medium">Data A</span>
                        <span className="text-[10px] text-indigo-400">Jan</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full w-5/6 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#1e2444] rounded-xl p-3 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-400 font-medium">Data B</span>
                        <span className="text-[10px] text-indigo-400">Feb</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full w-4/5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom row: 2 stat cards + bar chart */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Stat Card A */}
                  <div className="col-span-1 space-y-3">
                    <div className="bg-[#1e2444] rounded-xl p-4 border border-slate-700/30 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-white">68.209</p>
                        <p className="text-[10px] text-slate-400">Lorem ipsum dolor</p>
                      </div>
                      <svg width="80" height="32" viewBox="0 0 80 32">
                        <polyline points="0,24 10,20 20,22 30,14 40,16 50,8 60,12 70,4 80,10" fill="none" stroke="url(#sparkA)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                          <linearGradient id="sparkA" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    {/* Stat Card B */}
                    <div className="bg-[#1e2444] rounded-xl p-4 border border-slate-700/30 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        B
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-white">27.393</p>
                        <p className="text-[10px] text-slate-400">Lorem ipsum dolor</p>
                      </div>
                      <svg width="80" height="32" viewBox="0 0 80 32">
                        <polyline points="0,16 10,20 20,12 30,24 40,8 50,18 60,6 70,20 80,14" fill="none" stroke="url(#sparkB)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                          <linearGradient id="sparkB" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Large Bar Chart */}
                  <div className="col-span-2 bg-[#1e2444] rounded-xl p-4 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-slate-400 font-medium">Performance Mensal</span>
                      <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">70.89% average</span>
                    </div>
                    <div className="flex items-end gap-2 h-32 px-2">
                      {[
                        { a: 60, b: 40 },
                        { a: 35, b: 55 },
                        { a: 70, b: 30 },
                        { a: 45, b: 65 },
                        { a: 80, b: 45 },
                        { a: 55, b: 70 },
                        { a: 90, b: 50 },
                        { a: 65, b: 80 },
                        { a: 40, b: 60 },
                        { a: 75, b: 35 },
                        { a: 50, b: 55 },
                        { a: 85, b: 40 },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                          <div className="w-full flex gap-0.5 items-end h-24">
                            <div
                              className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm"
                              style={{ height: `${bar.a}%` }}
                            />
                            <div
                              className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm"
                              style={{ height: `${bar.b}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-slate-500">
                            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AGITAÇÃO DO PROBLEMA */}
      <section
        id="problema"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Por que o BI tradicional está{" "}
              <span className="text-red-500">travando o seu crescimento?</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Enquanto você lê isso, decisões estão sendo tomadas no escuro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileSpreadsheet className="w-7 h-7" />,
                color: "text-red-500 bg-red-50",
                title: "O inferno das planilhas manuais",
                description:
                  "Arquivos de 50MB que demoram minutos para abrir. Fórmulas quebradas que ninguém sabe consertar. Versões duplicadas que ninguém sabe qual é a correta. Você gasta mais tempo consertando planilhas do que analisando dados.",
              },
              {
                icon: <Clock className="w-7 h-7" />,
                color: "text-orange-500 bg-orange-50",
                title: "Semanas para ter um relatório pronto",
                description:
                  "Você pede um relatório na segunda-feira. O analista entrega na sexta — se tiver sorte. E quando chega, os dados já estão desatualizados. Sua empresa não pode esperar o fim do mês para saber se deu lucro hoje.",
              },
              {
                icon: <TrendingUp className="w-7 h-7" />,
                color: "text-amber-500 bg-amber-50",
                title: "O custo altíssimo de consultorias de BI",
                description:
                  "R$ 5.000, R$ 10.000, R$ 20.000 por mês para ter dashboards decentes. E mesmo assim, você depende de um especialista para cada alteração. Seu orçamento de BI é um buraco negro sem retorno claro.",
              },
            ].map((problem) => (
              <div
                key={problem.title}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl ${problem.color} flex items-center justify-center mb-6`}
                >
                  {problem.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-8 py-5">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <p className="text-lg font-semibold text-red-700">
                Sua empresa não pode esperar o fim do mês para saber se deu
                lucro hoje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. O MOMENTO "UAU" — 3 PASSOS */}
      <section id="solucao" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-5 py-2 mb-6">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Do dado bruto ao dashboard em 3 passos
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Conecte, faça upload,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                visualize.
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Sem curva de aprendizado. Sem departamento de TI. Sem dor de
              cabeça.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Database className="w-8 h-8" />,
                title: "Conectar",
                description:
                  "Conecte seu banco de dados SQL diretamente ao Profit BI. Suportamos SQL Server, MySQL e PostgreSQL.",
                color: "bg-indigo-600",
              },
              {
                step: "02",
                icon: <Upload className="w-8 h-8" />,
                title: "Upload",
                description:
                  "Ou faça upload da sua planilha Excel ou CSV. O Profit BI detecta automaticamente a estrutura e organiza tudo para você.",
                color: "bg-purple-600",
              },
              {
                step: "03",
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Visualizar",
                description:
                  "Dashboards prontos em menos de 10 segundos. Gráficos interativos, KPIs e insights automáticos — tudo com aparência profissional.",
                color: "bg-emerald-600",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-900 text-white mb-6">
                  {item.icon}
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed max-w-sm mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Estética callout */}
          <div className="mt-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 text-center border border-indigo-100">
            <Star className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Gráficos de nível executivo que impressionam em qualquer reunião
              de diretoria
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              Cada gráfico, cada KPI, cada insight é gerado com design
              profissional. Sua reunião de diretoria nunca mais será a mesma.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ECOSSISTEMA DE INTEGRAÇÕES */}
      <section
        id="integracoes"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Seus dados estão espalhados?
              <br />
              <span className="text-indigo-600">
                O Profit BI une todos em uma única fonte de verdade.
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: <FileSpreadsheet className="w-6 h-6" />,
                name: "Excel",
                desc: ".xlsx, .xls, .csv",
              },
              {
                icon: <Server className="w-6 h-6" />,
                name: "SQL Server",
                desc: "Microsoft SQL",
              },
              {
                icon: <Database className="w-6 h-6" />,
                name: "MySQL",
                desc: "Banco de dados",
              },
              {
                icon: <Database className="w-6 h-6" />,
                name: "PostgreSQL",
                desc: "Banco de dados",
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  {integration.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">
                  {integration.name}
                </h4>
                <p className="text-sm text-gray-400">{integration.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-300 text-center">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Em breve
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {["Google Sheets", "Meta Ads", "Google Analytics"].map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-2 bg-gray-50 text-gray-500 px-5 py-2.5 rounded-lg text-sm font-medium"
                >
                  <Clock className="w-4 h-4" />
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMPARATIVO DE ROI */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              O custo de <span className="text-red-500">não ter</span> o Profit
              BI
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Veja quanto sua empresa economiza ao substituir o método
              tradicional pela IA.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="text-center px-6 py-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Analista / Consultoria
                  </th>
                  <th className="text-center px-6 py-5 text-sm font-semibold text-white uppercase tracking-wider bg-indigo-600">
                    Profit BI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  {
                    item: "Custo",
                    traditional: "Caro (R$ 5.000+/mês)",
                    profitbi: "Acessível (R$ 35/mês)",
                  },
                  {
                    item: "Tempo de entrega",
                    traditional: "Lento (semanas)",
                    profitbi: "Instantâneo (10 segundos)",
                  },
                  {
                    item: "Curva de aprendizado",
                    traditional: "Difícil (requer especialista)",
                    profitbi: "Intuitivo (qualquer pessoa)",
                  },
                  {
                    item: "Visual dos dashboards",
                    traditional: "Básico",
                    profitbi: "Incrível (nível executivo)",
                  },
                  {
                    item: "Atualização",
                    traditional: "Manual, por demanda",
                    profitbi: "Automática, em tempo real",
                  },
                ].map((row, i) => (
                  <tr
                    key={row.item}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.item}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-500">
                      {row.traditional}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-indigo-700 bg-indigo-50/50">
                      {row.profitbi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-8 py-5">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <p className="text-lg font-semibold text-emerald-700">
                Economize 40h mensais de trabalho manual por colaborador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SEGURANÇA E ESCALABILIDADE — FOCO ENTERPRISE */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-6">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">
                Segurança Enterprise
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Robusto para grandes equipes.
              <br />
              <span className="text-indigo-400">
                Simples para qualquer gestor.
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Segurança de nível enterprise com a simplicidade que sua equipe
              precisa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock className="w-6 h-6" />,
                title: "Criptografia de ponta a ponta",
                description:
                  "AES-256 em repouso e TLS 1.3 em trânsito. Seus dados são protegidos com o mesmo padrão usado por instituições financeiras.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Conformidade com LGPD",
                description:
                  "Totalmente adequado à Lei Geral de Proteção de Dados. Backups automáticos, retenção configurável e direito ao esquecimento garantido.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Permissões por nível hierárquico",
                description:
                  "Controle granular de acesso: defina quem vê o quê. Do estagiário ao CEO, cada pessoa acessa apenas o que precisa.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PLANO ÚNICO */}
      <section id="precos" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Um plano.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Tudo incluso.
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Sem surpresas. Sem limites escondidos. Apenas dashboards incríveis.
            </p>
          </div>

          <div className="bg-gray-900 rounded-3xl p-10 shadow-2xl border-2 border-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-violet-600/10" />
            <div className="relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Profit BI Pro
                </h3>
                <p className="text-gray-400">
                  Tudo que você precisa para transformar dados em decisões
                </p>
              </div>

              <div className="text-center mb-10">
                <span className="text-6xl font-extrabold text-white">R$35</span>
                <span className="text-gray-400 text-xl ml-1">/mês</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {[
                  "Painéis ilimitados",
                  "Upload de Excel/CSV",
                  "Conexão com banco de dados (SQL)",
                  "Dashboards gerados em 10 segundos",
                  "Gráficos de nível executivo",
                  "Atualização em tempo real",
                  "Compartilhamento de dashboards",
                  "Criptografia de ponta a ponta",
                  "Conformidade com LGPD",
                  "Suporte prioritário",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href="/login?mode=register"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
              >
                Começar Agora
              </Link>

              <p className="text-center text-sm text-gray-500 mt-4">
                Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ESTRATÉGICO */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Perguntas <span className="text-indigo-600">frequentes</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Meus dados estão seguros?",
                a: "Absolutamente. Utilizamos criptografia AES-256 para dados em repouso e TLS 1.3 para dados em trânsito. Seguimos rigorosamente a LGPD e realizamos backups automáticos diários. Seus dados são tão seguros quanto em um banco.",
              },
              {
                q: "Preciso saber programar?",
                a: "Não. O Profit BI foi criado para que qualquer pessoa — do estagiário ao CEO — possa criar dashboards profissionais. Basta conectar seu banco ou fazer upload da planilha. A IA faz o resto.",
              },
              {
                q: "Como os dashboards são atualizados?",
                a: "Automaticamente. Ao conectar seu banco de dados, o Profit BI sincroniza os dados em tempo real. Para arquivos Excel, basta fazer o upload da nova versão e tudo se atualiza instantaneamente. Sem trabalho manual.",
              },
              {
                q: "O Profit BI substitui o Power BI?",
                a: "Para a maioria das PMEs, sim — e com muito mais agilidade. O Power BI exige especialistas, semanas de configuração e manutenção constante. O Profit BI entrega resultados em 10 segundos, com qualquer pessoa operando.",
              },
              {
                q: "Posso cancelar minha assinatura a qualquer momento?",
                a: "Sim, sem multas ou burocracia. Seus dados ficam disponíveis por 30 dias após o cancelamento para que você possa exportar tudo que precisar.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-gray-900 font-semibold hover:bg-gray-50 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-6 text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
            Pare de tomar decisões no escuro.
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Conecte seus dados e tenha dashboards profissionais em menos de 10
            segundos.
          </p>
          <Link
            href="/login?mode=register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-indigo-700 px-10 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
          >
            Criar Conta Gratuita
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-indigo-300">
            Sem cartão de crédito • Setup em 2 minutos • Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <span className="text-xl font-bold text-white">
                <span className="text-indigo-400">Profit</span> BI
              </span>
              <p className="mt-4 text-sm leading-relaxed">
                Business Intelligence simplificado para todos os negócios.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#solucao"
                    className="hover:text-white transition-colors"
                  >
                    Solução
                  </a>
                </li>
                <li>
                  <a
                    href="#integracoes"
                    className="hover:text-white transition-colors"
                  >
                    Integrações
                  </a>
                </li>
                <li>
                  <a
                    href="#precos"
                    className="hover:text-white transition-colors"
                  >
                    Preços
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:suporte@profitbi.com.br"
                    className="hover:text-white transition-colors"
                  >
                    suporte@profitbi.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Profit BI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
