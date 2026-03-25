import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Política de Privacidade - Profit BI" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-2xl border border-gray-100">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: Outubro de 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Coleta e Uso de Informações</h2>
            <p>A confidencialidade de seus dados é essencial para a Profit BI. Coletamos informações de contato para funcionamento das contas e autenticação em nosso próprio banco de dados PostgreSQL. Também processamos temporariamente suas planilhas para a geração de lógica artificial estrita, respeitando integralmente sua privacidade.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Privacidade e Inteligência Artificial</h2>
            <p>Nossas operações envolvem envio de pequenos pacotes (schemas de banco e uma pequena amostragem textual processada de suas colunas) para os serviços Large Language Models da Ollama Cloud. Mantemos uma política de restrição: <strong>Suas planilhas não serão utilizadas sob nenhuma hipótese para pré-treinamento global de IAs publicas.</strong> Toda conversa com o painel é isolada no seu Workspace privado.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Compartilhamento</h2>
            <p>A Profit BI proíbe estritamente e não comercializa seus bancos de dados e listas de usuários a terceiros. Apenas repassamos o que garante nossa conectividade e nuvem operante (processadores de autenticação e LLMs designados por API).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies e Armazenamento</h2>
            <p>Utilizamos cookies estritamente necessários (gerenciados por nossa camada de autenticação) para manter a integridade da sua sessão ativa. Também guardamos em seu próprio navegador (LocalStorage) as configurações de aparência visual, notas explicativas dos gráficos e reorganização que você decide fazer nas suas telas – garantindo privacidade absoluta na personalização local e maior rapidez do sistema.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Exclusão e Retenção de Dados (LGPD)</h2>
            <p>Você tem o direito de gerenciar, editar ou excluir permanentemente seus arquivos submetidos. Nós deletamos de modo irrevogável ("hard deletion") o dataset quando o mesmo for excluído pelo provedor titular da conta, a fim de obedecer as regulamentações internacionais e territoriais.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
