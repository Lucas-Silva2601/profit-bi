import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Termos de Uso - Profit BI" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-2xl border border-gray-100">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Última atualização: Março de 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p>Ao acessar e utilizar a plataforma Profit BI, você concorda em cumprir e sujeitar-se a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços de relatórios automáticos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Uso do Serviço</h2>
            <p>O Profit BI é uma ferramenta de Business Intelligence e visualização de dados baseada em Inteligência Artificial. Você concorda em utilizar a plataforma estritamente para fins legais e de forma que não infrinja os direitos de terceiros ou restrinja o uso civil da infraestrutura.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Propriedade Intelectual</h2>
            <p>Todo o conteúdo gerado pela plataforma, sua estrutura, código e design são propriedade intelectual do Profit BI, sob a respectiva proteção das leis de propriedade intelectual.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Dados e Informações do Usuário</h2>
            <p>Você é o único responsável pelos dados, planilhas e métricas inseridos em seu Workspace. O Profit BI atua apenas como processador para visualização e insights gerados pela IA, assegurando a proteção regulada na <Link href="/privacy" className="text-indigo-600 hover:underline">Política de Privacidade</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Limitação de Responsabilidade</h2>
            <p>O Profit BI processa seus dados através de Modelos de Linguagem e, embora adotemos tecnologia de ponta, não há garantias implícitas na exatidão cega dos gráficos sem validação prévia. Nós não nos responsabilizamos por perdas financeiras advindas de más interpretações do usuário sobre os painéis formados.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
