import { NextResponse } from "next/server";
import { generateText } from "ai";
import { aiConfigured, ollamaModel } from "@/utils/ai/provider";
import { rateLimit } from "@/utils/rate-limit";
import { chatSchema } from "@/utils/validation";
import { db } from "@/db";
import { datasets, datasetRows, workspaces } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/utils/session";

export async function POST(req: Request) {
  try {
    if (!aiConfigured()) {
      return NextResponse.json(
        { error: "Chave da Ollama Cloud não configurada." },
        { status: 400 },
      );
    }

    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`ai-chat:${user.id}`, 20, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Limite de mensagens excedido. Aguarde um momento." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { datasetId, question, history = [], chartTitles = [] } = parsed.data;

    // Escopo multi-tenant: linhas só se o dataset pertencer ao usuário
    const rows = await db
      .select({ row_data: datasetRows.rowData })
      .from(datasetRows)
      .innerJoin(datasets, eq(datasetRows.datasetId, datasets.id))
      .innerJoin(workspaces, eq(datasets.workspaceId, workspaces.id))
      .where(
        and(eq(datasetRows.datasetId, datasetId), eq(workspaces.ownerId, user.id))
      )
      .limit(300);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Dataset vazio ou não encontrado." },
        { status: 404 },
      );
    }

    const columnsSet = new Set<string>();
    rows.forEach((r) =>
      Object.keys(r.row_data ?? {}).forEach((k) => columnsSet.add(k)),
    );
    const columns = Array.from(columnsSet);
    const sampleData = rows.slice(0, 15).map((r) => r.row_data);

    const recentHistory = history.slice(-6) as {
      role: "user" | "assistant";
      content: string;
    }[];
    const historyText = recentHistory
      .map(
        (m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`,
      )
      .join("\n");

    const systemPrompt = `Você é um Analista de BI especialista. O usuário enviou um dataset com as seguintes colunas: ${columns.join(", ")}.
Amostra dos primeiros 15 registros:
${JSON.stringify(sampleData, null, 2)}

Gráficos atualmente visíveis no painel do usuário:
${chartTitles.length ? chartTitles.join(" | ") : "Nenhum no momento."}

Responda perguntas sobre esse dataset de forma direta, objetiva e com linguagem de negócios em português (pt-BR).
Inclua números concretos quando possível.
Não mencione que está analisando uma "amostra" — responda como se tivesse o dataset completo.

AÇÃO ESPECIAL - CONTROLE DE DASHBOARD:
Se o usuário pedir explicitamente para ocultar, alterar formato ou mexer em um gráfico, adicione no final de sua resposta uma tag oculta com o JSON da ação. A interface lerá essa tag.
Exemplo 1 (Ocultar / Remover gráfico): <action>{"type": "HIDE_CHART", "title": "Nome exato do grafico aqui"}</action>
Exemplo 2 (Trocar tipo de gráfico): <action>{"type": "CHANGE_CHART_TYPE", "title": "Nome exato do grafico aqui", "newType": "line"}</action> (opções: "bar", "line", "pie", "area")
Sempre respeite as palavras maiúsculas/minúsculas dos títulos dos gráficos visíveis. O json deve ser estritamente stringificado numa linha sem quebras antes da resposta acabar.

Limite sua resposta a 800 caracteres.`;

    const prompt = `${historyText ? `Histórico da conversa:\n${historyText}\n\n` : ""}Pergunta atual: ${question}`;

    const { text } = await generateText({
      model: ollamaModel(),
      system: systemPrompt,
      prompt,
      temperature: 0.3,
    });

    return NextResponse.json({ answer: text });
  } catch (error: any) {
    console.error("Chat AI Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
