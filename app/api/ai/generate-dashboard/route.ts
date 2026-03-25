import { NextResponse } from "next/server";
import { generateText } from "ai";
import { aiConfigured, ollamaModel } from "@/utils/ai/provider";
import { z } from "zod";
import { rateLimit } from "@/utils/rate-limit";
import { generateDashboardSchema } from "@/utils/validation";
import { db } from "@/db";
import { dashboards, datasets, datasetRows, workspaces } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getSessionUser } from "@/utils/session";

const dashboardSchema = z.object({
  kpis: z
    .array(
      z.object({
        title: z
          .string()
          .describe("Título executivo do KPI (ex: Faturamento, Total Vendas)"),
        metric_column: z
          .string()
          .describe("A coluna exata no dataset que será usada na métrica"),
        aggregation: z
          .enum(["sum", "count", "average", "max", "min"])
          .describe("A operação matemática no dataset"),
        format: z
          .enum(["currency", "number", "percentage"])
          .describe("Como formatar o número final"),
      }),
    )
    .max(4),
  charts: z
    .array(
      z.object({
        title: z
          .string()
          .describe("Título do Gráfico (ex: Vendas por Mês, Top Vendedores)"),
        type: z
          .enum(["line", "bar", "area"])
          .describe("O melhor tipo de gráfico para essa dimensão"),
        xAxisColumn: z
          .string()
          .describe("Coluna para o Eixo X (Dimensão, ex: Data ou Categoria)"),
        yAxisColumn: z
          .string()
          .describe("Coluna para o Eixo Y (Métrica numérica)"),
        yAggregation: z
          .enum(["sum", "count", "average"])
          .describe("Agregação aplicada no eixo Y (ex: soma das vendas)"),
      }),
    )
    .max(4),
});

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
    const limit = rateLimit(`ai-generate:${user.id}`, 5, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Limite de geração excedido. Aguarde um momento." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = generateDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { datasetId, workspaceId } = parsed.data;

    // Ownership verification: check that dataset belongs to user's workspace
    const [dataset] = await db
      .select({ id: datasets.id, workspaceId: datasets.workspaceId })
      .from(datasets)
      .innerJoin(workspaces, eq(datasets.workspaceId, workspaces.id))
      .where(and(eq(datasets.id, datasetId), eq(workspaces.ownerId, user.id)))
      .limit(1);

    if (!dataset) {
      return NextResponse.json(
        { error: "Sem permissão para acessar este dataset" },
        { status: 404 },
      );
    }

    // Busca massiva para garantir representatividade de TODAS as abas do Excel
    const rows = await db
      .select({ row_data: datasetRows.rowData })
      .from(datasetRows)
      .where(eq(datasetRows.datasetId, datasetId))
      .limit(5000);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Dataset sem dados" }, { status: 400 });
    }

    const columnsSet = new Set<string>();
    const abasOrigem = new Set<string>();

    rows.forEach((r: any) => {
      if (r.row_data) {
        Object.keys(r.row_data).forEach((k) => columnsSet.add(k));
        if (r.row_data["Aba_Origem"]) {
          abasOrigem.add(r.row_data["Aba_Origem"]);
        }
      }
    });

    const columns = Array.from(columnsSet);
    const uniqueAbas = Array.from(abasOrigem);
    const sampleData =
      uniqueAbas.length > 0
        ? uniqueAbas.flatMap((aba) =>
            rows
              .filter((r: any) => r.row_data?.["Aba_Origem"] === aba)
              .slice(0, 5)
              .map((r: any) => r.row_data),
          )
        : rows.slice(0, 20).map((r: any) => r.row_data);

    function detectColumnType(col: string, sample: any[]): string {
      const lower = col.toLowerCase();
      if (
        /(data|date|mes|ano|year|month|dia|week|semana|periodo|trimestre)/.test(
          lower,
        )
      )
        return "date";
      if (
        /(valor|total|preco|price|custo|faturamento|receita|venda|quantidade|qtd|amount|lucro|despesa|imposto|frete|salario)/.test(
          lower,
        )
      )
        return "number";
      if (
        /(nome|categoria|status|tipo|regiao|cidade|estado|pais|vendedor|produto|cliente|genero|departamento|filial|canal)/.test(
          lower,
        )
      )
        return "category";
      const nums = sample.filter((r: any) => {
        const v = r[col];
        if (v === null || v === undefined) return false;
        const n = parseFloat(
          String(v)
            .replace(/[^\d.,-]/g, "")
            .replace(",", "."),
        );
        return !isNaN(n);
      }).length;
      if (nums > sample.length * 0.6) return "number";
      return "category";
    }

    const columnAnalysis = columns.map((col) => {
      const type = detectColumnType(col, sampleData);
      return { name: col, type };
    });

    const prompt = `Você é um Diretor de BI e Estrategista de Dados com 20+ anos de experiência. Sua missão é analisar dados brutos e construir dashboards executivos profissionais que gerem insights acionáveis.

## ETAPA 1 — ANÁLISE PROFUNDA DO DATASET
Analise CADA coluna das amostras de dados fornecidas:
1. Identifique o TIPO DE NEGÓCIO (varejo, SaaS, RH, logística, saúde, educação, financeiro, etc.)
2. Para CADA coluna, determine: é data? é número? é categoria? tem muitos valores nulos/vazios?
3. Identifique as MÉTRICAS-CHAVE do negócio (faturamento, margem, conversão, etc.)
4. Identifique as DIMENSÕES de análise mais relevantes (tempo, categoria, região, produto, etc.)

## ETAPA 2 — FILTRO DE QUALIDADE DE DADOS (CRÍTICO)
ANTES de criar gráficos, avalie a qualidade de cada coluna:
- REJEITE colunas onde mais de 30% dos valores são nulos, vazios, "Desconhecido", "N/A" ou "Unknown"
- REJEITE colunas categóricas com apenas 1 valor único (sem variação)
- REJEITE colunas numéricas onde todos os valores são zero
- REJEITE colunas que são IDs técnicos (ex: "id_produto", "cod_cliente") — elas não geram insights
- PREFIRA colunas com nomes de negócio claros (ex: "Nome_Produto", "Categoria", "Data_Venda")
- NUNCA use colunas como "Aba_Origem" para gráficos ou filtros

## ETAPA 3 — SELEÇÃO INTELIGENTE DE GRÁFICOS
Use a tabela abaixo para escolher o gráfico CERTO para cada tipo de análise:

| Tipo de Análise | Gráfico | Quando Usar |
|---|---|---|
| Evolução ao longo do tempo | line | Quando há coluna de data/mês/ano |
| Comparação entre categorias | bar | Para comparar vendas por produto, região, etc. |
| Proporção/participação | pie | Máximo 6-8 categorias. Use para market share |
| Composição temporal | area | Múltiplas séries ao longo do tempo |
| Correlação entre 2 métricas | scatter | Quando há 2+ colunas numéricas relacionadas |
| Ranking | bar | Top N produtos, vendedores, etc. |

Regras de Ouro:
- Dados temporais (data, mês, ano) → SEMPRE use line ou area
- Categorias com poucos valores (2-8) → bar ou pie
- Categorias com muitos valores (9+) → SEMPRE bar, NUNCA pie
- Proporções que somam 100% → pie (máx 8 fatias)
- Dois números relacionados (ex: custo vs venda) → scatter
- NUNCA use pizza para mais de 8 categorias
- NUNCA repita o mesmo tipo de gráfico com dados similares
- NUNCA crie gráficos com colunas de baixa qualidade (>30% nulos)

## ETAPA 4 — CONSTRUA O JSON
Retorne um JSON contendo KPIs, Gráficos e Filtros para o tipo de negócio identificado.

{
  "business_type": "descreva o tipo de negócio identificado",
  "kpis": [
    { 
      "title": "Título executivo claro (ex: Faturamento Total)", 
      "metric_column": "coluna_exata_do_dataset", 
      "aggregation": "sum|count|average|max|min", 
      "format": "currency|number|percentage" 
    }
  ],
  "charts": [
    { 
      "title": "Título descritivo e profissional", 
      "type": "line|bar|area|pie|scatter",
      "xAxisColumn": "coluna_eixo_x_limpa", 
      "yAxisColumn": "coluna_eixo_y_numerica", 
      "yAggregation": "sum|count|average",
      "description": "o que este gráfico revela para o negócio"
    }
  ],
  "filters": [
    {
      "column_name": "coluna_categórica_limpa",
      "label": "Nome Amigável (Ex: Categoria)",
      "type": "select"
    }
  ]
}

Regras Críticas:
1. NEGÓCIO: Identifique o contexto e crie KPIs/gráficos RELEVANTES. Um dashboard de RH é diferente de um de vendas.
2. COBERTURA: Se há múltiplas abas [ ${uniqueAbas.join(", ") || "dados únicos"} ], cubra TODAS as dimensões importantes de todas as abas.
3. KPIs: Crie 6 a 8 KPIs que respondam às perguntas MAIS IMPORTANTES daquele negócio.
4. GRÁFICOS: Crie 8 a 12 gráficos com VARIEDADE inteligente:
   - Pelo menos 1 line (SE houver coluna de data com dados válidos)
   - Pelo menos 2 bar (comparações entre categorias)
   - Pelo menos 1 pie (proporção, APENAS se a categoria tiver 2-8 valores únicos)
   - Pelo menos 1 area (se houver dados temporais com múltiplas séries)
   - Pelo menos 1 scatter (se houver 2+ colunas numéricas correlacionadas)
5. COLUNAS: Use APENAS colunas existentes: ${columns.join(", ")}.
6. ANÁLISE DE TIPOS: Classificação detectada: ${columnAnalysis.map((c: any) => `${c.name}=${c.type}`).join(", ")}.
7. QUALIDADE: NUNCA use colunas com muitos valores nulos/vazios/"Desconhecido". Se uma coluna tem >30% de dados inválidos, IGNORE-A.
8. Filtros: Até 3 filtros usando colunas categóricas LIMpas (sem "Desconhecido", "N/A", etc). NUNCA use "Aba_Origem".
9. TÍTULOS: Use títulos profissionais em português. Evite nomes técnicos de colunas nos títulos.
10. RETORNE APENAS JSON VÁLIDO. Sem markdown, sem explicações.`;

    const { text } = await generateText({
      model: ollamaModel(),
      prompt: prompt,
      temperature: 0.1,
    });

    // Limpeza de possíveis formatações markdown alucinadas pela IA
    const cleanJsonString = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const object = JSON.parse(cleanJsonString);

    // Save into workspace dashboard.
    const existingDash = await db
      .select({ id: dashboards.id })
      .from(dashboards)
      .where(eq(dashboards.workspaceId, workspaceId))
      .limit(1);

    if (existingDash.length > 0) {
      await db
        .update(dashboards)
        .set({ layoutConfig: object })
        .where(eq(dashboards.id, existingDash[0].id));
    } else {
      await db.insert(dashboards).values({
        workspaceId,
        name: "Dashboard de IA",
        layoutConfig: object,
      });
    }

    return NextResponse.json({ success: true, layout: object });
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
