import { NextResponse } from "next/server";
import { generateText } from "ai";
import { aiConfigured, ollamaModel } from "@/utils/ai/provider";
import { rateLimit } from "@/utils/rate-limit";
import { insightsSchema } from "@/utils/validation";
import { getSessionUser } from "@/utils/session";

export async function POST(req: Request) {
  try {
    if (!aiConfigured()) {
      return NextResponse.json(
        { error: "Chave da Ollama Cloud não configurada" },
        { status: 400 },
      );
    }

    const user = await getSessionUser();

    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`ai-insights:${user.id}`, 10, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Limite de requisições excedido." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = insightsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { totalVolume, totalSales, ticketMedio, topCategory } = parsed.data;

    const prompt = `Você é um consultor e estrategista financeiro de alto nível. 
Analise brevemente os seguintes indicadores de negócio para um pequeno/médio empreendedor. Forneça parágrafos muito curtos e direto ao ponto com 1 ou 2 dicas acionáveis.
Faturamento Total: ${totalVolume}
Número de Vendas: ${totalSales}
Ticket Médio: ${ticketMedio}
Categoria e Carro-chefe: ${topCategory}

Mantenha o tom profissional, encorajador e pragmático. Não faça introduções desnecessárias, vá direto aos insights. Limite a sua resposta a 1000 caracteres no máximo.`;

    const { text } = await generateText({
      model: ollamaModel(),
      prompt: prompt,
    });

    return NextResponse.json({ insight: text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
